"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Panel from "../ui/Panel";
import StatusMessage from "../ui/StatusMessage";
import { useInventoryWorkspace } from "./useInventoryWorkspace";
import {
  buildCategoryBreakdown,
  buildClientAlerts,
  buildMovementFeed,
  buildSummary,
  buildTopMovingMaterials,
  compactNumberFormatter,
  currencyFormatter,
  dateTimeFormatter,
  findMaterialByCode,
  getMaterialState,
  getMaterialStateMeta,
  numberFormatter,
} from "../../lib/inventory";

export default function InventoryDashboard() {
  const router = useRouter();
  const [scanValue, setScanValue] = useState("");
  const {
    roleConfig,
    permissions,
    materials,
    suppliers,
    stockIns,
    stockOuts,
    report,
    reportBlocked,
    loading,
    syncing,
    error,
    lastSyncedAt,
    refresh,
  } = useInventoryWorkspace();

  if (loading && materials.length === 0) {
    return <DashboardSkeleton />;
  }

  const summary = report?.summary || buildSummary({
    materials,
    suppliers,
    stockIns,
    stockOuts,
  });
  const alerts = (report?.alerts || buildClientAlerts(materials)).slice(0, 5);
  const movementFeed = (report?.recentMovements || buildMovementFeed(stockIns, stockOuts)).slice(
    0,
    8,
  );
  const topMovingMaterials =
    report?.topMovingMaterials ||
    buildTopMovingMaterials(materials, stockIns, stockOuts);
  const categoryBreakdown =
    report?.categoryBreakdown || buildCategoryBreakdown(materials);
  const telemetry = report?.telemetry || {
    lastMovementAt: movementFeed[0]?.date || null,
    scanCoverage: summary.materialCount
      ? Math.round((summary.scanReadyCount / summary.materialCount) * 100)
      : 0,
    lowStockRate: summary.materialCount
      ? Math.round((summary.lowStockCount / summary.materialCount) * 100)
      : 0,
    syncStatus: syncing ? "refreshing" : "live",
  };

  const criticalMaterials = [...materials]
    .sort((left, right) => {
      const stateRank = { out: 0, critical: 1, low: 2, healthy: 3 };
      return (
        stateRank[getMaterialState(left)] - stateRank[getMaterialState(right)] ||
        Number(right.Quantity || 0) - Number(left.Quantity || 0)
      );
    })
    .slice(0, 5);
  const scannedMaterial = findMaterialByCode(materials, scanValue);

  return (
    <div className="space-y-5">
      {error ? (
        <StatusMessage status={{ type: "error", message: error }} />
      ) : null}

      <section className="grid gap-5 xl:grid-cols-[1.55fr_0.95fr]">
        <Panel
          title="Operations Pulse"
          subtitle="One surface for live stock health, replenishment pressure, and transaction readiness."
          right={
            <div className="flex flex-wrap gap-2">
              <Link
                href="/dashboard/materials"
                className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
              >
                Open inventory
              </Link>
              <Link
                href="/dashboard/movements"
                className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
              >
                Capture movement
              </Link>
            </div>
          }
        >
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[28px] bg-slate-950 px-5 py-5 text-white">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                Centralized dashboard
              </p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight">
                Utility-driven control room for warehouse teams
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Track live inventory exposure, drive scan-based data entry, and
                surface operational decisions by role without switching contexts.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <FeatureChip label="Centralized Dashboard" />
                <FeatureChip label="Real-Time Indicators" />
                <FeatureChip label="Barcode / RFID Ready" />
                <FeatureChip label="Automated Alerts" />
              </div>
            </div>

            <div className="grid gap-3">
              <IndicatorTile
                label="Live sync"
                value={syncing ? "Refreshing" : "Connected"}
                note={
                  lastSyncedAt
                    ? `Last updated ${dateTimeFormatter.format(new Date(lastSyncedAt))}`
                    : "Initial sync complete"
                }
                tone="teal"
              />
              <IndicatorTile
                label="Open alerts"
                value={numberFormatter.format(summary.alertCount || alerts.length)}
                note="Notifications driven by reorder, stock-out, and quarantine logic"
                tone="amber"
              />
              <IndicatorTile
                label="Role view"
                value={roleConfig.label}
                note={roleConfig.description}
                tone="slate"
              />
            </div>
          </div>
        </Panel>

        <Panel
          title="Live Indicators"
          subtitle="Realtime cues for inventory health and traceability coverage."
          right={
            <button
              type="button"
              onClick={() => void refresh()}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
            >
              {syncing ? "Refreshing..." : "Refresh"}
            </button>
          }
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <MetricBand
              label="Traceability coverage"
              value={`${telemetry.scanCoverage}%`}
              note={`${summary.scanReadyCount} items have barcode or RFID identifiers`}
            />
            <MetricBand
              label="Low stock rate"
              value={`${telemetry.lowStockRate}%`}
              note={`${summary.lowStockCount} items need attention before the next shift`}
            />
            <MetricBand
              label="Latest movement"
              value={
                telemetry.lastMovementAt
                  ? dateTimeFormatter.format(new Date(telemetry.lastMovementAt))
                  : "No movement yet"
              }
              note="Activity feed updates automatically in the workspace"
            />
          </div>
        </Panel>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Inventory value"
          value={currencyFormatter.format(summary.totalInventoryValue || 0)}
          note={`${numberFormatter.format(summary.materialCount)} tracked materials`}
        />
        <SummaryCard
          label="On-hand quantity"
          value={compactNumberFormatter.format(summary.totalQuantity || 0)}
          note={`${numberFormatter.format(summary.totalStockIn || 0)} received vs ${numberFormatter.format(summary.totalStockOut || 0)} issued`}
        />
        <SummaryCard
          label="Supplier network"
          value={numberFormatter.format(summary.supplierCount || suppliers.length)}
          note="Approved partners available for movement and replenishment"
        />
        <SummaryCard
          label="Critical exposure"
          value={numberFormatter.format(
            summary.criticalCount || summary.outOfStockCount || 0,
          )}
          note="Items already below safety stock or fully depleted"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel
          title="Automated Alert Notifications"
          subtitle="Actionable alerts generated from inventory state and material status."
          right={
            <Link
              href="/dashboard/materials"
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
            >
              Review inventory
            </Link>
          }
        >
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <EmptyState
                title="No active alerts"
                description="Current stock levels and material states are within policy."
              />
            ) : (
              alerts.map((alert) => (
                <AlertRow key={alert.id} alert={alert} />
              ))
            )}
          </div>
        </Panel>

        <Panel
          title="Role-Based Views"
          subtitle="The workspace adapts navigation and write access around the signed-in role."
          right={
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              {roleConfig.label}
            </span>
          }
        >
          <div className="grid gap-3">
            <PermissionCard
              enabled={permissions.canManageMaterials}
              label="Inventory master data"
              description="Create and maintain SKU, location, reorder, pricing, and traceability records."
            />
            <PermissionCard
              enabled={permissions.canManageSuppliers}
              label="Supplier administration"
              description="Approve supplier contacts and attach preferred partners to materials."
            />
            <PermissionCard
              enabled={permissions.canViewReports}
              label="Reporting and analytics"
              description="Open throughput trends, category breakdowns, and alert distribution."
            />
            <PermissionCard
              enabled={permissions.canRecordMovements}
              label="Movement execution"
              description="Receive, issue, and verify stock with manual, barcode, or RFID capture modes."
            />
            {reportBlocked ? (
              <StatusMessage
                status={{
                  type: "warning",
                  message:
                    "Analytics is restricted for this role. Operational pages still stay fully responsive.",
                }}
              />
            ) : null}
          </div>
        </Panel>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel
          title="Inventory At Risk"
          subtitle="Prioritize the materials most likely to block fulfillment or production."
        >
          <div className="space-y-3">
            {criticalMaterials.length === 0 ? (
              <EmptyState
                title="No materials loaded"
                description="Create inventory records to start monitoring stock health."
              />
            ) : (
              criticalMaterials.map((material) => (
                <div
                  key={material._id}
                  className="flex flex-col gap-3 rounded-[24px] border border-slate-200 bg-slate-50/90 px-4 py-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold text-slate-900">
                        {material.MaterialName}
                      </p>
                      <StatePill state={getMaterialState(material)} />
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {material.location || "Main Warehouse"} · {material.category || "General"} · {material.Quantity}{" "}
                      {material.Unit}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/dashboard/materials/${material._id}`}
                      className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
                    >
                      Open detail
                    </Link>
                    <Link
                      href="/dashboard/movements"
                      className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                    >
                      Resolve stock
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>

        <Panel
          title="Barcode / RFID Scan Desk"
          subtitle="Look up a material instantly using its SKU, barcode, or RFID tag."
        >
          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Scan or paste inventory code
              </span>
              <input
                value={scanValue}
                onChange={(event) => setScanValue(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                placeholder="SKU, barcode, or RFID tag"
              />
            </label>

            {scanValue && !scannedMaterial ? (
              <StatusMessage
                status={{
                  type: "warning",
                  message:
                    "No matching inventory code yet. Check the barcode or RFID assignment on the material record.",
                }}
              />
            ) : null}

            {scannedMaterial ? (
              <div className="rounded-[26px] border border-slate-200 bg-slate-950 px-5 py-5 text-white">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                      Scan match
                    </p>
                    <h3 className="mt-2 text-xl font-semibold">
                      {scannedMaterial.MaterialName}
                    </h3>
                    <p className="mt-2 text-sm text-slate-300">
                      {scannedMaterial.sku || "Unassigned SKU"} · {scannedMaterial.Quantity}{" "}
                      {scannedMaterial.Unit} on hand
                    </p>
                  </div>
                  <StatePill state={getMaterialState(scannedMaterial)} dark />
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <ScanData label="Barcode" value={scannedMaterial.barcode || "Not set"} />
                  <ScanData label="RFID" value={scannedMaterial.rfidTag || "Not set"} />
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      router.push(`/dashboard/materials/${scannedMaterial._id}`)
                    }
                    className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-900"
                  >
                    Open product detail
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/dashboard/movements")}
                    className="rounded-2xl border border-white/15 px-4 py-2 text-sm font-medium text-white"
                  >
                    Use in transaction
                  </button>
                </div>
              </div>
            ) : (
              <EmptyState
                title="Traceability lookup ready"
                description="Every scan-ready material can be opened directly from this desk for quicker receiving and issuing."
              />
            )}
          </div>
        </Panel>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <Panel
          title="Recent Movement Activity"
          subtitle="Latest inbound and outbound transactions across the workspace."
        >
          <div className="space-y-3">
            {movementFeed.length === 0 ? (
              <EmptyState
                title="No movement activity"
                description="Once stock transactions start, they will appear here with method and operator context."
              />
            ) : (
              movementFeed.map((movement) => (
                <MovementRow key={`${movement.type}-${movement.id}`} movement={movement} />
              ))
            )}
          </div>
        </Panel>

        <Panel
          title="Analytics Snapshot"
          subtitle="Top categories and materials by throughput, surfaced in the operational workspace."
        >
          <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                Category value mix
              </p>
              {categoryBreakdown.slice(0, 4).map((category) => (
                <BarRow
                  key={category.category}
                  label={category.category}
                  value={currencyFormatter.format(category.inventoryValue || 0)}
                  percent={
                    categoryBreakdown[0]?.inventoryValue
                      ? Math.max(
                          8,
                          Math.round(
                            (category.inventoryValue /
                              categoryBreakdown[0].inventoryValue) *
                              100,
                          ),
                        )
                      : 0
                  }
                />
              ))}
            </div>

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                Throughput leaders
              </p>
              {topMovingMaterials.slice(0, 4).map((material) => (
                <div
                  key={material.id}
                  className="rounded-[24px] border border-slate-200 bg-slate-50/90 px-4 py-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {material.MaterialName}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">{material.sku}</p>
                    </div>
                    <StatePill state={material.stockState} />
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <KeyFigure
                      label="Inbound"
                      value={numberFormatter.format(material.inbound)}
                    />
                    <KeyFigure
                      label="Outbound"
                      value={numberFormatter.format(material.outbound)}
                    />
                    <KeyFigure
                      label="Value"
                      value={currencyFormatter.format(material.inventoryValue || 0)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </section>
    </div>
  );
}

function FeatureChip({ label }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-200">
      {label}
    </span>
  );
}

function IndicatorTile({ label, value, note, tone }) {
  const accent =
    tone === "teal"
      ? "text-teal-600"
      : tone === "amber"
        ? "text-amber-600"
        : "text-slate-800";

  return (
    <div className="rounded-[26px] border border-slate-200 bg-slate-50/90 px-4 py-4">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className={`mt-3 text-2xl font-semibold tracking-tight ${accent}`}>
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{note}</p>
    </div>
  );
}

function MetricBand({ label, value, note }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50/90 px-4 py-4">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-2 text-xl font-semibold text-slate-900">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{note}</p>
    </div>
  );
}

function SummaryCard({ label, value, note }) {
  return (
    <article className="rounded-[28px] border border-slate-200 bg-white/88 px-5 py-5 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.28)]">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
        {value}
      </p>
      <p className="mt-3 text-sm leading-6 text-slate-500">{note}</p>
    </article>
  );
}

function AlertRow({ alert }) {
  const tone =
    alert.severity === "critical"
      ? "border-rose-200 bg-rose-50"
      : alert.severity === "high"
        ? "border-amber-200 bg-amber-50"
        : "border-slate-200 bg-slate-50";

  return (
    <div className={`rounded-[24px] border px-4 py-4 ${tone}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold text-slate-900">{alert.title}</p>
        <span className="rounded-full bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
          {alert.severity}
        </span>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{alert.message}</p>
    </div>
  );
}

function PermissionCard({ enabled, label, description }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50/90 px-4 py-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold text-slate-900">{label}</p>
        <span
          className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
            enabled
              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
              : "bg-slate-100 text-slate-500 ring-1 ring-slate-200"
          }`}
        >
          {enabled ? "Enabled" : "Hidden"}
        </span>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function StatePill({ state, dark = false }) {
  const meta = getMaterialStateMeta(state);

  return (
    <span
      className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
        dark
          ? "border border-white/10 bg-white/8 text-white"
          : meta.className
      }`}
    >
      {meta.label}
    </span>
  );
}

function ScanData({ label, value }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/6 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-medium text-white">{value}</p>
    </div>
  );
}

function MovementRow({ movement }) {
  const isInbound = movement.type === "IN";

  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50/90 px-4 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                isInbound
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
          Method: {movement.captureMode}
        </span>
        {movement.referenceCode ? (
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
            Ref: {movement.referenceCode}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function BarRow({ label, value, percent }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50/90 px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold text-slate-900">{label}</p>
        <p className="text-sm text-slate-500">{value}</p>
      </div>
      <div className="mt-3 h-2 rounded-full bg-slate-200">
        <div
          className="h-2 rounded-full bg-slate-900"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function KeyFigure({ label, value }) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-white px-3 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function EmptyState({ title, description }) {
  return (
    <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/80 px-4 py-6 text-sm text-slate-500">
      <p className="font-semibold text-slate-700">{title}</p>
      <p className="mt-2 leading-6">{description}</p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-5">
      <div className="grid gap-5 xl:grid-cols-[1.55fr_0.95fr]">
        <SkeletonCard className="min-h-[280px]" />
        <SkeletonCard className="min-h-[280px]" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SkeletonCard className="min-h-[140px]" />
        <SkeletonCard className="min-h-[140px]" />
        <SkeletonCard className="min-h-[140px]" />
        <SkeletonCard className="min-h-[140px]" />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <SkeletonCard className="min-h-[300px]" />
        <SkeletonCard className="min-h-[300px]" />
      </div>
    </div>
  );
}

function SkeletonCard({ className }) {
  return (
    <div
      className={`animate-pulse rounded-[30px] border border-slate-200 bg-white/70 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.28)] ${className}`}
    />
  );
}
