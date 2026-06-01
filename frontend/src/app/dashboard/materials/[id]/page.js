"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import ProtectedPageShell from "../../../../components/dashboard/ProtectedPageShell";
import Panel from "../../../../components/ui/Panel";
import StatusMessage from "../../../../components/ui/StatusMessage";
import { useInventoryWorkspace } from "../../../../components/dashboard/useInventoryWorkspace";
import {
  currencyFormatter,
  dateTimeFormatter,
  getMaterialState,
  getMaterialStateMeta,
  numberFormatter,
} from "../../../../lib/inventory";

export default function MaterialDetailPage() {
  const params = useParams();
  const materialId = Array.isArray(params?.id) ? params.id[0] : params?.id || "";
  const { materialDetail, loading, error } = useInventoryWorkspace({ materialId });

  const material = materialDetail?.material;
  const movementSummary = materialDetail?.movementSummary;
  const recentMovements = materialDetail?.recentMovements || [];

  return (
    <ProtectedPageShell
      title="Product Detail"
      subtitle="Inspect inventory health, traceability, and recent movement history for an individual product."
      actions={
        <Link
          href="/dashboard/materials"
          className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
        >
          Back to listings
        </Link>
      }
    >
      {error ? <StatusMessage status={{ type: "error", message: error }} /> : null}

      {loading && !material ? (
        <div className="rounded-[30px] border border-slate-200 bg-white/88 px-6 py-12 text-sm text-slate-500 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.28)]">
          Loading product detail...
        </div>
      ) : !material ? (
        <Panel
          title="Material not found"
          subtitle="The requested inventory record could not be located."
        >
          <p className="text-sm text-slate-500">
            Return to the inventory listings and choose a valid material.
          </p>
        </Panel>
      ) : (
        <div className="space-y-5">
          <Panel
            title={material.MaterialName}
            subtitle="Detailed product profile with traceability, stock policy, and movement insight."
            right={
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                  getMaterialStateMeta(getMaterialState(material)).className
                }`}
              >
                {getMaterialStateMeta(getMaterialState(material)).label}
              </span>
            }
          >
            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[28px] bg-slate-950 px-5 py-5 text-white">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                  Traceability profile
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <DetailCell label="SKU" value={material.sku || "Unassigned"} dark />
                  <DetailCell label="Barcode" value={material.barcode || "Not assigned"} dark />
                  <DetailCell label="RFID" value={material.rfidTag || "Not assigned"} dark />
                  <DetailCell
                    label="Preferred supplier"
                    value={material.preferredSupplierId?.SupplierName || "Not assigned"}
                    dark
                  />
                </div>
                {material.description ? (
                  <p className="mt-5 text-sm leading-6 text-slate-300">
                    {material.description}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-3">
                <StatCard
                  label="On hand"
                  value={`${numberFormatter.format(material.Quantity || 0)} ${material.Unit}`}
                />
                <StatCard
                  label="Inventory value"
                  value={currencyFormatter.format(material.inventoryValue || 0)}
                />
                <StatCard
                  label="Net flow"
                  value={numberFormatter.format(movementSummary?.netFlow || 0)}
                />
              </div>
            </div>
          </Panel>

          <section className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
            <Panel
              title="Stock Policy"
              subtitle="Reorder and audit settings attached to this material."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <DetailCell
                  label="Category"
                  value={material.category || "General"}
                />
                <DetailCell
                  label="Location"
                  value={material.location || "Main Warehouse"}
                />
                <DetailCell
                  label="Reorder point"
                  value={`${numberFormatter.format(material.reorderPoint || 0)} ${material.Unit}`}
                />
                <DetailCell
                  label="Safety stock"
                  value={`${numberFormatter.format(material.safetyStock || 0)} ${material.Unit}`}
                />
                <DetailCell label="Status" value={material.status || "active"} />
                <DetailCell
                  label="Last audit"
                  value={
                    material.lastAuditDate
                      ? dateTimeFormatter.format(new Date(material.lastAuditDate))
                      : "No audit recorded"
                  }
                />
              </div>
            </Panel>

            <Panel
              title="Movement Summary"
              subtitle="Recent item-level movement metrics sourced from the live transaction log."
            >
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <DetailCell
                  label="Total stock in"
                  value={numberFormatter.format(movementSummary?.totalStockIn || 0)}
                />
                <DetailCell
                  label="Total stock out"
                  value={numberFormatter.format(movementSummary?.totalStockOut || 0)}
                />
                <DetailCell
                  label="Last received"
                  value={
                    movementSummary?.lastReceivedAt
                      ? dateTimeFormatter.format(
                          new Date(movementSummary.lastReceivedAt),
                        )
                      : "No receipt"
                  }
                />
                <DetailCell
                  label="Last issued"
                  value={
                    movementSummary?.lastIssuedAt
                      ? dateTimeFormatter.format(
                          new Date(movementSummary.lastIssuedAt),
                        )
                      : "No issue"
                  }
                />
              </div>
            </Panel>
          </section>

          <Panel
            title="Recent Product Activity"
            subtitle="Item-level movement trail with capture mode and responsible operator."
          >
            <div className="space-y-3">
              {recentMovements.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                  No movement history has been recorded for this material yet.
                </div>
              ) : (
                recentMovements.map((movement) => (
                  <div
                    key={`${movement.type}-${movement.id}`}
                    className="rounded-[24px] border border-slate-200 bg-slate-50/90 px-4 py-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                              movement.type === "IN"
                                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                                : "bg-rose-50 text-rose-700 ring-1 ring-rose-100"
                            }`}
                          >
                            {movement.type}
                          </span>
                          <p className="font-semibold text-slate-900">
                            {numberFormatter.format(movement.quantity)} units
                          </p>
                        </div>
                        <p className="mt-2 text-sm text-slate-500">
                          {movement.supplier} · {movement.actor}
                        </p>
                      </div>
                      <div className="text-right text-sm text-slate-500">
                        <p>{dateTimeFormatter.format(new Date(movement.date))}</p>
                        <p className="mt-1 uppercase tracking-[0.18em]">
                          {movement.captureMode}
                        </p>
                      </div>
                    </div>
                    {movement.referenceCode ? (
                      <p className="mt-3 text-sm text-slate-600">
                        Reference: {movement.referenceCode}
                      </p>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </Panel>
        </div>
      )}
    </ProtectedPageShell>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50/90 px-4 py-4">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-3 text-xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function DetailCell({ label, value, dark = false }) {
  return (
    <div
      className={`rounded-[24px] border px-4 py-4 ${
        dark
          ? "border-white/10 bg-white/6"
          : "border-slate-200 bg-slate-50/90"
      }`}
    >
      <p
        className={`text-xs uppercase tracking-[0.18em] ${
          dark ? "text-slate-400" : "text-slate-400"
        }`}
      >
        {label}
      </p>
      <p className={`mt-3 text-sm font-semibold ${dark ? "text-white" : "text-slate-900"}`}>
        {value}
      </p>
    </div>
  );
}
