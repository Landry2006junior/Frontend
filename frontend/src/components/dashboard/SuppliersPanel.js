"use client";

import Panel from "../ui/Panel";
import StatusMessage from "../ui/StatusMessage";
import { useInventoryWorkspace } from "./useInventoryWorkspace";
import { numberFormatter } from "../../lib/inventory";
import { useState } from "react";

export default function SuppliersPanel() {
  const {
    suppliers,
    materials,
    permissions,
    createSupplier,
    loading,
  } = useInventoryWorkspace();
  const [form, setForm] = useState({ SupplierName: "", phoneNumber: "" });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const supplierRows = suppliers.map((supplier) => {
    const linkedMaterials = materials.filter((material) => {
      const preferredId =
        material.preferredSupplierId?._id || material.preferredSupplierId || "";
      return preferredId === supplier._id;
    });

    return {
      ...supplier,
      linkedMaterials,
    };
  });

  const unassignedMaterials = materials.filter((material) => {
    const preferredId =
      material.preferredSupplierId?._id || material.preferredSupplierId || "";
    return !preferredId;
  });

  const updateForm = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const submitSupplier = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      await createSupplier({
        SupplierName: form.SupplierName.trim(),
        phoneNumber: form.phoneNumber.trim(),
      });
      setStatus({
        type: "success",
        message: "Supplier created and available for inventory assignment.",
      });
      setForm({ SupplierName: "", phoneNumber: "" });
    } catch (requestError) {
      setStatus({ type: "error", message: requestError.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
      <Panel
        title="Supplier Directory"
        subtitle="Track supplier coverage, partner contact data, and assignment gaps across the inventory base."
        right={
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            {numberFormatter.format(suppliers.length)} suppliers
          </span>
        }
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Supplier partners"
            value={numberFormatter.format(suppliers.length)}
            note="Approved external inventory partners"
          />
          <StatCard
            label="Assigned materials"
            value={numberFormatter.format(
              materials.length - unassignedMaterials.length,
            )}
            note="Materials with a preferred supplier attached"
          />
          <StatCard
            label="Coverage gaps"
            value={numberFormatter.format(unassignedMaterials.length)}
            note="Materials still missing a supplier assignment"
          />
        </div>

        <div className="mt-5 space-y-3">
          {loading && suppliers.length === 0 ? (
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
              Loading supplier directory...
            </div>
          ) : supplierRows.length === 0 ? (
            <EmptyState
              title="No suppliers configured"
              description="Create supplier records so inventory items can be linked to approved partners."
            />
          ) : (
            supplierRows.map((supplier) => (
              <div
                key={supplier._id}
                className="rounded-[24px] border border-slate-200 bg-slate-50/90 px-4 py-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {supplier.SupplierName}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {supplier.phoneNumber}
                    </p>
                  </div>
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {numberFormatter.format(supplier.linkedMaterials.length)} linked
                  </span>
                </div>

                {supplier.linkedMaterials.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                    {supplier.linkedMaterials.slice(0, 4).map((material) => (
                      <span
                        key={material._id}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1"
                      >
                        {material.MaterialName}
                      </span>
                    ))}
                    {supplier.linkedMaterials.length > 4 ? (
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                        +{supplier.linkedMaterials.length - 4} more
                      </span>
                    ) : null}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">
                    No preferred materials assigned yet.
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </Panel>

      <div className="space-y-5">
        <Panel
          title="Supplier Management"
          subtitle={
            permissions.canManageSuppliers
              ? "Create partner records that can be assigned to material profiles."
              : "This role can view supplier coverage but not create or edit supplier records."
          }
        >
          {permissions.canManageSuppliers ? (
            <form className="grid gap-3" onSubmit={submitSupplier}>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Supplier name
                <input
                  value={form.SupplierName}
                  onChange={updateForm("SupplierName")}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  placeholder="Northern Metals"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Phone number
                <input
                  value={form.phoneNumber}
                  onChange={updateForm("phoneNumber")}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  placeholder="+1 555 010 205"
                />
              </label>
              <StatusMessage status={status} />
              <button
                type="submit"
                disabled={submitting}
                className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {submitting ? "Creating supplier..." : "Create supplier"}
              </button>
            </form>
          ) : (
            <StatusMessage
              status={{
                type: "warning",
                message:
                  "Supplier administration is restricted for this role. Ask a manager or administrator to create new suppliers.",
              }}
            />
          )}
        </Panel>

        <Panel
          title="Coverage Gaps"
          subtitle="Materials that still need a preferred supplier assignment."
        >
          <div className="space-y-3">
            {unassignedMaterials.length === 0 ? (
              <EmptyState
                title="No coverage gaps"
                description="Every material currently has a preferred supplier linked."
              />
            ) : (
              unassignedMaterials.slice(0, 8).map((material) => (
                <div
                  key={material._id}
                  className="rounded-[24px] border border-slate-200 bg-slate-50/90 px-4 py-4"
                >
                  <p className="font-semibold text-slate-900">
                    {material.MaterialName}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {material.category || "General"} · {material.location || "Main Warehouse"}
                  </p>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function StatCard({ label, value, note }) {
  return (
    <article className="rounded-[24px] border border-slate-200 bg-slate-50/90 px-4 py-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{note}</p>
    </article>
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
