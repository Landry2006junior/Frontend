"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import Panel from "../ui/Panel";
import StatusMessage from "../ui/StatusMessage";
import { useInventoryWorkspace } from "./useInventoryWorkspace";
import {
  buildClientAlerts,
  currencyFormatter,
  getMaterialState,
  getMaterialStateMeta,
  normalizeMaterialPayload,
  numberFormatter,
} from "../../lib/inventory";

const EMPTY_FORM = {
  MaterialName: "",
  sku: "",
  category: "General",
  location: "Main Warehouse",
  Quantity: "0",
  Unit: "units",
  UnitPrice: "0",
  reorderPoint: "10",
  safetyStock: "5",
  barcode: "",
  rfidTag: "",
  preferredSupplierId: "",
  status: "active",
  description: "",
  lastAuditDate: "",
};

export default function RawMaterialsPanel() {
  const {
    materials,
    suppliers,
    permissions,
    loading,
    saveMaterial,
  } = useInventoryWorkspace();
  const [searchValue, setSearchValue] = useState("");
  const deferredSearch = useDeferredValue(searchValue);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [editingId, setEditingId] = useState("");
  const [activeMaterialId, setActiveMaterialId] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const categories = Array.from(
    new Set(materials.map((material) => material.category || "General")),
  ).sort((left, right) => left.localeCompare(right));

  const locations = Array.from(
    new Set(materials.map((material) => material.location || "Main Warehouse")),
  ).sort((left, right) => left.localeCompare(right));

  const filteredMaterials = [...materials]
    .filter((material) => {
      const state = getMaterialState(material);
      const matchesSearch = deferredSearch
        ? [
            material.MaterialName,
            material.sku,
            material.barcode,
            material.rfidTag,
            material.category,
            material.location,
          ]
            .filter(Boolean)
            .some((entry) =>
              entry.toLowerCase().includes(deferredSearch.toLowerCase()),
            )
        : true;
      const matchesCategory =
        categoryFilter === "all" ||
        (material.category || "General") === categoryFilter;
      const matchesLocation =
        locationFilter === "all" ||
        (material.location || "Main Warehouse") === locationFilter;
      const matchesState = stateFilter === "all" || state === stateFilter;

      return matchesSearch && matchesCategory && matchesLocation && matchesState;
    })
    .sort((left, right) => {
      if (sortBy === "value") {
        return (
          Number(right.inventoryValue || right.Quantity * right.UnitPrice) -
          Number(left.inventoryValue || left.Quantity * left.UnitPrice)
        );
      }

      if (sortBy === "quantity") {
        return Number(right.Quantity || 0) - Number(left.Quantity || 0);
      }

      if (sortBy === "updated") {
        return new Date(right.updatedAt || 0) - new Date(left.updatedAt || 0);
      }

      return left.MaterialName.localeCompare(right.MaterialName);
    });

  const activeMaterial =
    materials.find((material) => material._id === activeMaterialId) ||
    filteredMaterials[0] ||
    materials[0] ||
    null;
  const alerts = buildClientAlerts(materials);

  const updateForm = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId("");
  };

  const startEdit = (material) => {
    setEditingId(material._id);
    setActiveMaterialId(material._id);
    setForm({
      MaterialName: material.MaterialName || "",
      sku: material.sku || "",
      category: material.category || "General",
      location: material.location || "Main Warehouse",
      Quantity: String(material.Quantity ?? 0),
      Unit: material.Unit || "units",
      UnitPrice: String(material.UnitPrice ?? 0),
      reorderPoint: String(material.reorderPoint ?? 10),
      safetyStock: String(material.safetyStock ?? 5),
      barcode: material.barcode || "",
      rfidTag: material.rfidTag || "",
      preferredSupplierId:
        material.preferredSupplierId?._id || material.preferredSupplierId || "",
      status: material.status || "active",
      description: material.description || "",
      lastAuditDate: material.lastAuditDate
        ? material.lastAuditDate.slice(0, 10)
        : "",
    });
  };

  const submitMaterial = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      await saveMaterial(normalizeMaterialPayload(form), editingId);
      setStatus({
        type: "success",
        message: editingId
          ? "Material profile updated successfully."
          : "Material created successfully.",
      });
      resetForm();
    } catch (requestError) {
      setStatus({ type: "error", message: requestError.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
      <Panel
        title="Inventory Listings with Search / Filters"
        subtitle="Filter by stock state, location, and category while keeping product detail pages one click away."
        right={
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            {numberFormatter.format(filteredMaterials.length)} visible
          </span>
        }
      >
        <div className="space-y-4">
          {alerts.length > 0 ? (
            <StatusMessage
              status={{
                type: "warning",
                message: `${alerts.length} inventory notifications are active. Prioritize the items marked low, critical, or out of stock.`,
              }}
            />
          ) : null}

          <div className="grid gap-3 lg:grid-cols-[1.5fr_repeat(4,minmax(0,1fr))]">
            <input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              placeholder="Search by material, SKU, barcode, or RFID"
            />
            <FilterSelect
              value={stateFilter}
              onChange={(event) => setStateFilter(event.target.value)}
              options={[
                { value: "all", label: "All states" },
                { value: "healthy", label: "Healthy" },
                { value: "low", label: "Low" },
                { value: "critical", label: "Critical" },
                { value: "out", label: "Out of stock" },
              ]}
            />
            <FilterSelect
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              options={[
                { value: "all", label: "All categories" },
                ...categories.map((category) => ({
                  value: category,
                  label: category,
                })),
              ]}
            />
            <FilterSelect
              value={locationFilter}
              onChange={(event) => setLocationFilter(event.target.value)}
              options={[
                { value: "all", label: "All locations" },
                ...locations.map((location) => ({
                  value: location,
                  label: location,
                })),
              ]}
            />
            <FilterSelect
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              options={[
                { value: "name", label: "Sort: Name" },
                { value: "quantity", label: "Sort: Quantity" },
                { value: "value", label: "Sort: Value" },
                { value: "updated", label: "Sort: Updated" },
              ]}
            />
          </div>

          <div className="grid gap-3">
            {loading && materials.length === 0 ? (
              <div className="rounded-[26px] border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                Loading inventory listings...
              </div>
            ) : filteredMaterials.length === 0 ? (
              <div className="rounded-[26px] border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                No materials match the active filters.
              </div>
            ) : (
              filteredMaterials.map((material) => {
                const state = getMaterialState(material);
                const stateMeta = getMaterialStateMeta(state);

                return (
                  <article
                    key={material._id}
                    className="rounded-[28px] border border-slate-200 bg-slate-50/90 px-4 py-4"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveMaterialId(material._id)}
                            className="text-left text-lg font-semibold text-slate-900"
                          >
                            {material.MaterialName}
                          </button>
                          <span
                            className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${stateMeta.className}`}
                          >
                            {stateMeta.label}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">
                          {(material.sku || "Unassigned SKU") + " · "}
                          {(material.category || "General") + " · "}
                          {(material.location || "Main Warehouse")}
                        </p>
                        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                          {material.barcode ? (
                            <TraceTag label="Barcode" value={material.barcode} />
                          ) : null}
                          {material.rfidTag ? (
                            <TraceTag label="RFID" value={material.rfidTag} />
                          ) : null}
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
                        <StatPill
                          label="On hand"
                          value={`${numberFormatter.format(material.Quantity || 0)} ${material.Unit}`}
                        />
                        <StatPill
                          label="Value"
                          value={currencyFormatter.format(
                            material.inventoryValue ||
                              Number(material.Quantity || 0) *
                                Number(material.UnitPrice || 0),
                          )}
                        />
                        <StatPill
                          label="Reorder"
                          value={`${numberFormatter.format(material.reorderPoint || 0)} ${material.Unit}`}
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        href={`/dashboard/materials/${material._id}`}
                        className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                      >
                        Product detail
                      </Link>
                      <button
                        type="button"
                        onClick={() => setActiveMaterialId(material._id)}
                        className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
                      >
                        Preview
                      </button>
                      {permissions.canManageMaterials ? (
                        <button
                          type="button"
                          onClick={() => startEdit(material)}
                          className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
                        >
                          Edit record
                        </button>
                      ) : null}
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </Panel>

      <div className="space-y-5">
        <Panel
          title={
            permissions.canManageMaterials
              ? editingId
                ? "Update Material Record"
                : "Efficient Data Entry"
              : "Product Preview"
          }
          subtitle={
            permissions.canManageMaterials
              ? "Maintain SKU, stock policy, barcode, RFID, and supplier details in one form."
              : "Your role has read-only access to inventory master data."
          }
          right={
            permissions.canManageMaterials && editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
              >
                Clear edit
              </button>
            ) : null
          }
        >
          {permissions.canManageMaterials ? (
            <form className="grid gap-3" onSubmit={submitMaterial}>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Material name"
                  value={form.MaterialName}
                  onChange={updateForm("MaterialName")}
                  placeholder="Copper wiring"
                />
                <Field
                  label="SKU"
                  value={form.sku}
                  onChange={updateForm("sku")}
                  placeholder="MAT-001"
                />
                <Field
                  label="Category"
                  value={form.category}
                  onChange={updateForm("category")}
                  placeholder="Electrical"
                />
                <Field
                  label="Location"
                  value={form.location}
                  onChange={updateForm("location")}
                  placeholder="Aisle B3"
                />
                <Field
                  label="Quantity"
                  type="number"
                  min="0"
                  value={form.Quantity}
                  onChange={updateForm("Quantity")}
                  placeholder="0"
                />
                <Field
                  label="Unit"
                  value={form.Unit}
                  onChange={updateForm("Unit")}
                  placeholder="rolls"
                />
                <Field
                  label="Unit price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.UnitPrice}
                  onChange={updateForm("UnitPrice")}
                  placeholder="0"
                />
                <Field
                  label="Preferred supplier"
                  as="select"
                  value={form.preferredSupplierId}
                  onChange={updateForm("preferredSupplierId")}
                >
                  <option value="">No preferred supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier._id} value={supplier._id}>
                      {supplier.SupplierName}
                    </option>
                  ))}
                </Field>
                <Field
                  label="Reorder point"
                  type="number"
                  min="0"
                  value={form.reorderPoint}
                  onChange={updateForm("reorderPoint")}
                  placeholder="10"
                />
                <Field
                  label="Safety stock"
                  type="number"
                  min="0"
                  value={form.safetyStock}
                  onChange={updateForm("safetyStock")}
                  placeholder="5"
                />
                <Field
                  label="Barcode"
                  value={form.barcode}
                  onChange={updateForm("barcode")}
                  placeholder="890123456789"
                />
                <Field
                  label="RFID tag"
                  value={form.rfidTag}
                  onChange={updateForm("rfidTag")}
                  placeholder="RFID-WH-0042"
                />
                <Field
                  label="Status"
                  as="select"
                  value={form.status}
                  onChange={updateForm("status")}
                >
                  <option value="active">Active</option>
                  <option value="quarantined">Quarantined</option>
                  <option value="discontinued">Discontinued</option>
                </Field>
                <Field
                  label="Last audit date"
                  type="date"
                  value={form.lastAuditDate}
                  onChange={updateForm("lastAuditDate")}
                />
              </div>

              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Description
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={updateForm("description")}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  placeholder="Material notes, quality constraints, or special handling guidance"
                />
              </label>

              <StatusMessage status={status} />

              <button
                type="submit"
                disabled={submitting}
                className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {submitting
                  ? "Saving material..."
                  : editingId
                    ? "Update material"
                    : "Create material"}
              </button>
            </form>
          ) : (
            <ReadOnlyMaterialCard material={activeMaterial} />
          )}
        </Panel>

        <Panel
          title="Selected Product Snapshot"
          subtitle="Quick product detail context before opening the dedicated item page."
        >
          <ReadOnlyMaterialCard material={activeMaterial} />
        </Panel>
      </div>
    </div>
  );
}

function FilterSelect({ options, ...props }) {
  return (
    <select
      {...props}
      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function Field({ as = "input", children, label, ...props }) {
  const Component = as;

  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      {label}
      <Component
        {...props}
        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
      >
        {children}
      </Component>
    </label>
  );
}

function TraceTag({ label, value }) {
  return (
    <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
      {label}: {value}
    </span>
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

function ReadOnlyMaterialCard({ material }) {
  if (!material) {
    return (
      <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
        Pick a material from the list to inspect its live profile.
      </div>
    );
  }

  const state = getMaterialState(material);
  const stateMeta = getMaterialStateMeta(state);

  return (
    <div className="rounded-[28px] border border-slate-200 bg-slate-50/90 px-4 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Active product
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
        <StatPill
          label="Barcode"
          value={material.barcode || "Not assigned"}
        />
        <StatPill label="RFID" value={material.rfidTag || "Not assigned"} />
      </div>

      {material.description ? (
        <p className="mt-4 text-sm leading-6 text-slate-600">
          {material.description}
        </p>
      ) : null}
    </div>
  );
}
