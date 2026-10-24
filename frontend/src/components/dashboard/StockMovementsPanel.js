"use client";

import { useState } from "react";
import Panel from "../ui/Panel";
import StatusMessage from "../ui/StatusMessage";
import { useInventoryWorkspace } from "./useInventoryWorkspace";
import {
  buildMovementFeed,
  currencyFormatter,
  dateTimeFormatter,
  findMaterialByCode,
  getMaterialState,
  getMaterialStateMeta,
  numberFormatter,
} from "../../lib/inventory";
import {
  hasErrors,
  validateLettersOnly,
  validateNumber,
  validateReferenceCode,
  validateText,
} from "../../lib/validation";

const EMPTY_FORM = {
  direction: "in",
  captureMode: "manual",
  scannerInput: "",
  materialId: "",
  supplierId: "",
  quantity: "",
  referenceCode: "",
  referenceOverride: "",
  notes: "",
};

export default function StockMovementsPanel() {
  const {
    materials,
    suppliers,
    permissions,
    stockIns,
    stockOuts,
    loading,
    recordMovement,
  } = useInventoryWorkspace();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const recentMovements = buildMovementFeed(stockIns, stockOuts).slice(0, 10);
  const matchedMaterial =
    form.captureMode === "manual"
      ? null
      : findMaterialByCode(materials, form.scannerInput);
  const selectedMaterial =
    materials.find((material) => material._id === form.materialId) ||
    matchedMaterial ||
    null;
  const selectedSupplier =
    suppliers.find((supplier) => supplier._id === form.supplierId) || null;
  const requestedQuantity = Number(form.quantity || 0);
  const isOutbound = form.direction === "out";
  const quantityWarning =
    isOutbound &&
    selectedMaterial &&
    requestedQuantity > Number(selectedMaterial.Quantity || 0)
      ? "Requested stock-out exceeds the quantity currently on hand."
      : "";

  const updateForm = (field) => (event) => {
    const nextValue = event.target.value;

    setErrors((current) => {
      const nextErrors = { ...current, [field]: "" };
      if (field === "scannerInput") {
        nextErrors.materialId = "";
      }
      return nextErrors;
    });

    setForm((current) => {
      if (field === "scannerInput") {
        const nextMatch =
          current.captureMode === "manual"
            ? null
            : findMaterialByCode(materials, nextValue);

        return {
          ...current,
          scannerInput: nextValue,
          materialId: nextMatch?._id || current.materialId,
        };
      }

      return { ...current, [field]: nextValue };
    });
  };

  const validate = () => {
    const nextErrors = {
      materialId: validateText(form.materialId, "Material", { required: true }),
      supplierId: validateText(form.supplierId, "Supplier", { required: true }),
      quantity: validateNumber(form.quantity, "Quantity", {
        positiveOnly: true,
        required: true,
      }),
      referenceCode: validateReferenceCode(form.referenceCode, { required: true }),
      referenceOverride: validateLettersOnly(
        form.referenceOverride,
        "Reference override",
        { required: true },
      ),
      notes: validateLettersOnly(form.notes, "Notes", { required: true }),
    };

    if (isOutbound && selectedMaterial && !nextErrors.quantity) {
      const availableQuantity = Number(selectedMaterial.Quantity || 0);
      if (Number(form.quantity) > availableQuantity) {
        nextErrors.quantity =
          "Quantity out cannot exceed the available stock.";
      }
    }

    return nextErrors;
  };

  const submitMovement = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    setStatus({ type: "", message: "" });

    if (hasErrors(nextErrors)) {
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        materialId: form.materialId,
        supplierId: form.supplierId,
        captureMode: form.captureMode,
        referenceCode: form.referenceCode.trim() || form.scannerInput.trim(),
        referenceOverride: form.referenceOverride.trim(),
        notes: form.notes.trim(),
      };

      if (form.direction === "in") {
        payload.stockInQuantity = Number(form.quantity);
      } else {
        payload.stockOutQuantity = Number(form.quantity);
      }

      await recordMovement(form.direction, payload);
      setStatus({
        type: "success",
        message:
          form.direction === "in"
            ? "Inbound stock recorded and quantity refreshed."
            : "Outbound stock recorded and inventory balance updated.",
      });
      setForm((current) => ({
        ...EMPTY_FORM,
        direction: current.direction,
      }));
      setErrors({});
    } catch (requestError) {
      setStatus({ type: "error", message: requestError.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
      <Panel
        title="Efficient Data Entry"
        subtitle="Use a single console for inbound and outbound transactions with manual, barcode, or RFID capture."
        right={
          <div className="flex flex-wrap gap-2">
            <DirectionToggle
              active={form.direction === "in"}
              onClick={() =>
                setForm((current) => ({ ...current, direction: "in" }))
              }
            >
              Stock in
            </DirectionToggle>
            <DirectionToggle
              active={form.direction === "out"}
              outbound
              onClick={() =>
                setForm((current) => ({ ...current, direction: "out" }))
              }
            >
              Stock out
            </DirectionToggle>
          </div>
        }
      >
        <form className="space-y-4" onSubmit={submitMovement} noValidate>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Capture mode" as="select" value={form.captureMode} onChange={updateForm("captureMode")}>
              <option value="manual">Manual entry</option>
              <option value="barcode">Barcode</option>
              <option value="rfid">RFID</option>
            </Field>
            <Field
              label="Reference code"
              value={form.referenceCode}
              onChange={updateForm("referenceCode")}
              error={errors.referenceCode}
              placeholder="Letters, numbers, and dashes"
            />
            <Field
              label="Material"
              as="select"
              value={form.materialId}
              onChange={updateForm("materialId")}
              error={errors.materialId}
            >
              <option value="">Select material</option>
              {materials.map((material) => (
                <option key={material._id} value={material._id}>
                  {material.MaterialName}
                </option>
              ))}
            </Field>
            <Field
              label="Supplier"
              as="select"
              value={form.supplierId}
              onChange={updateForm("supplierId")}
              error={errors.supplierId}
            >
              <option value="">Select supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier._id} value={supplier._id}>
                  {supplier.SupplierName}
                </option>
              ))}
            </Field>
            <Field
              label="Quantity"
              type="number"
              value={form.quantity}
              onChange={updateForm("quantity")}
              error={errors.quantity}
              placeholder="Positive number only"
            />
            <Field
              label="Reference override"
              value={form.referenceOverride}
              onChange={updateForm("referenceOverride")}
              error={errors.referenceOverride}
              placeholder="Letters only"
            />
          </div>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Notes
            <textarea
              rows={4}
              value={form.notes}
              onChange={updateForm("notes")}
              className={`rounded-2xl border bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition ${
                errors.notes
                  ? "border-rose-400 focus:border-rose-400"
                  : "border-slate-200 focus:border-slate-400"
              }`}
              placeholder="Letters only"
            />
            {errors.notes ? (
              <span className="text-xs font-normal text-rose-600">
                {errors.notes}
              </span>
            ) : null}
          </label>

          {matchedMaterial ? (
            <StatusMessage
              status={{
                type: "success",
                message: `Scan match found: ${matchedMaterial.MaterialName}. The material selection has been aligned automatically.`,
              }}
            />
          ) : null}

          {quantityWarning ? (
            <StatusMessage status={{ type: "warning", message: quantityWarning }} />
          ) : null}

          <StatusMessage status={status} />

          <button
            type="submit"
            disabled={submitting || !permissions.canRecordMovements}
            className={`rounded-2xl px-4 py-3 text-sm font-semibold text-white disabled:opacity-60 ${
              isOutbound ? "bg-rose-600" : "bg-slate-900"
            }`}
          >
            {submitting
              ? "Recording transaction..."
              : isOutbound
                ? "Record stock out"
                : "Record stock in"}
          </button>
        </form>
      </Panel>

      <div className="space-y-5">
        <Panel
          title="Active Product Context"
          subtitle="Validate stock balance, value, and traceability before confirming the transaction."
        >
          {selectedMaterial ? (
            <SelectedMaterialCard
              material={selectedMaterial}
              supplier={selectedSupplier}
            />
          ) : (
            <EmptyState
              title="No product selected"
              description="Pick a material manually or use scan mode to bind the transaction to a traceable item."
            />
          )}
        </Panel>

        <Panel
          title="Visual Feedback"
          subtitle="Recent transactions with movement direction, operator context, and capture mode."
          right={
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {numberFormatter.format(recentMovements.length)} recent
            </span>
          }
        >
          <div className="space-y-3">
            {loading && recentMovements.length === 0 ? (
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                Loading transaction history...
              </div>
            ) : recentMovements.length === 0 ? (
              <EmptyState
                title="No movement history yet"
                description="Transactions will appear here once the team starts receiving or issuing inventory."
              />
            ) : (
              recentMovements.map((movement) => (
                <MovementRow key={`${movement.type}-${movement.id}`} movement={movement} />
              ))
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function DirectionToggle({ active, children, outbound, ...props }) {
  return (
    <button
      type="button"
      {...props}
      className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
        active
          ? outbound
            ? "bg-rose-600 text-white"
            : "bg-slate-900 text-white"
          : "border border-slate-200 text-slate-700"
      }`}
    >
      {children}
    </button>
  );
}

function Field({ as = "input", children, label, error, ...props }) {
  const Component = as;

  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      {label}
      <Component
        {...props}
        className={`rounded-2xl border bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition ${
          error
            ? "border-rose-400 focus:border-rose-400"
            : "border-slate-200 focus:border-slate-400"
        }`}
      >
        {children}
      </Component>
      {error ? (
        <span className="text-xs font-normal text-rose-600">{error}</span>
      ) : null}
    </label>
  );
}

function SelectedMaterialCard({ material, supplier }) {
  const stateMeta = getMaterialStateMeta(getMaterialState(material));

  return (
    <div className="rounded-[28px] border border-slate-200 bg-slate-50/90 px-4 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Selected material
          </p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">
            {material.MaterialName}
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            {material.location || "Main Warehouse"} · {material.category || "General"}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${stateMeta.className}`}
        >
          {stateMeta.label}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <StatPill
          label="On hand"
          value={`${numberFormatter.format(material.Quantity || 0)} ${material.Unit}`}
        />
        <StatPill
          label="Inventory value"
          value={currencyFormatter.format(
            material.inventoryValue ||
              Number(material.Quantity || 0) * Number(material.UnitPrice || 0),
          )}
        />
        <StatPill label="Barcode" value={material.barcode || "Not assigned"} />
        <StatPill label="RFID" value={material.rfidTag || "Not assigned"} />
      </div>

      {supplier ? (
        <p className="mt-4 text-sm text-slate-600">
          Transaction supplier: <span className="font-semibold">{supplier.SupplierName}</span>
        </p>
      ) : null}
    </div>
  );
}

function MovementRow({ movement }) {
  const inbound = movement.type === "IN";

  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50/90 px-4 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                inbound
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                  : "bg-rose-50 text-rose-700 ring-1 ring-rose-100"
              }`}
            >
              {movement.type}
            </span>
            <p className="font-semibold text-slate-900">{movement.material}</p>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            {movement.supplier} · {movement.actor}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-slate-900">
            {numberFormatter.format(movement.quantity)}
          </p>
          <p className="text-sm text-slate-500">
            {dateTimeFormatter.format(new Date(movement.date))}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
          {movement.captureMode}
        </span>
        {movement.referenceCode ? (
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
            {movement.referenceCode}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function StatPill({ label, value }) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-white px-3 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function EmptyState({ title, description }) {
  return (
    <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
      <p className="font-semibold text-slate-700">{title}</p>
      <p className="mt-2 leading-6">{description}</p>
    </div>
  );
}
