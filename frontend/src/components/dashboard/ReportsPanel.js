"use client";

import Panel from "../ui/Panel";
import StatusMessage from "../ui/StatusMessage";
import { useInventoryWorkspace } from "./useInventoryWorkspace";
import {
  buildCategoryBreakdown,
  buildClientAlerts,
  buildMovementFeed,
  buildSummary,
  buildTopMovingMaterials,
  currencyFormatter,
  dateTimeFormatter,
  numberFormatter,
} from "../../lib/inventory";

export default function ReportsPanel() {
  const {
    permissions,
    materials,
    suppliers,
    stockIns,
    stockOuts,
    report,
    reportBlocked,
    syncing,
    error,
    refresh,
  } = useInventoryWorkspace();

  if (!permissions.canViewReports || reportBlocked) {
    return (
      <Panel
        title="Reporting & Analytics Panel"
        subtitle="Analytics access is restricted by role to keep the workspace aligned with responsibility."
      >
        <StatusMessage
          status={{
            type: "warning",
            message:
              "This role does not have access to analytics dashboards. Use the command center, inventory, and movement pages for live operational work.",
          }}
        />
      </Panel>
    );
  }

  const summary = report?.summary || buildSummary({
    materials,
    suppliers,
    stockIns,
    stockOuts,
  });
  const alerts = report?.alerts || buildClientAlerts(materials);
  const categoryBreakdown =
    report?.categoryBreakdown || buildCategoryBreakdown(materials);
  const topMovingMaterials =
    report?.topMovingMaterials ||
    buildTopMovingMaterials(materials, stockIns, stockOuts);
  const movementFeed =
    report?.recentMovements || buildMovementFeed(stockIns, stockOuts);
  const healthDistribution = report?.healthDistribution || {
    healthy: materials.filter((material) => material.stockState === "healthy").length,
    low: summary.lowStockCount || 0,
    critical: summary.criticalCount || 0,
    out: summary.outOfStockCount || 0,
  };
  const movementTrend = report?.movementTrend || [];

  return (
    <div className="space-y-5">
      {error ? (
        <StatusMessage status={{ type: "error", message: error }} />
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Inventory value"
          value={currencyFormatter.format(summary.totalInventoryValue || 0)}
          note="Current balance sheet exposure"
        />
        <MetricCard
          label="Material count"
          value={numberFormatter.format(summary.materialCount || 0)}
          note="Tracked SKUs inside the workspace"
        />
        <MetricCard
          label="Low stock items"
          value={numberFormatter.format(summary.lowStockCount || 0)}
          note="Approaching or below reorder thresholds"
        />
        <MetricCard
          label="Traceability ready"
          value={numberFormatter.format(summary.scanReadyCount || 0)}
          note="Materials with barcode or RFID identifiers"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <Panel
          title="Automated Alert Notifications"
          subtitle="Alerts generated from stock policy and material state."
        >
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <EmptyState
                title="No analytics alerts"
                description="Everything is operating inside the expected stock and status policy."
              />
            ) : (
              alerts.map((alert) => <AlertRow key={alert.id} alert={alert} />)
            )}
          </div>
        </Panel>

        <Panel
          title="Movement Trend"
          subtitle="Seven-day inbound and outbound volume snapshot."
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
          <div className="space-y-3">
            {movementTrend.length === 0 ? (
              <EmptyState
                title="No movement trend yet"
                description="Trend bars will appear once the system has movement activity to aggregate."
              />
            ) : (
              movementTrend.map((row) => {
                const maxValue = Math.max(
                  ...movementTrend.map((entry) =>
                    Math.max(entry.stockIn || 0, entry.stockOut || 0),
                  ),
                  1,
                );

                return (
                  <div
                    key={row.date}
                    className="rounded-[24px] border border-slate-200 bg-slate-50/90 px-4 py-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-slate-900">{row.date}</p>
                      <p className="text-sm text-slate-500">
                        In {numberFormatter.format(row.stockIn || 0)} · Out{" "}
                        {numberFormatter.format(row.stockOut || 0)}
                      </p>
                    </div>
                    <div className="mt-3 grid gap-2">
                      <TrendBar
                        label="Inbound"
                        value={row.stockIn || 0}
                        maxValue={maxValue}
                        className="bg-emerald-500"
                      />
                      <TrendBar
                        label="Outbound"
                        value={row.stockOut || 0}
                        maxValue={maxValue}
                        className="bg-rose-500"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Panel>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <Panel
          title="Category Breakdown"
          subtitle="Inventory value grouped by category."
        >
          <div className="space-y-3">
            {categoryBreakdown.map((category) => {
              const leadingValue = categoryBreakdown[0]?.inventoryValue || 1;
              const width = Math.max(
                8,
                Math.round((category.inventoryValue / leadingValue) * 100),
              );

              return (
                <div
                  key={category.category}
                  className="rounded-[24px] border border-slate-200 bg-slate-50/90 px-4 py-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-slate-900">{category.category}</p>
                    <p className="text-sm text-slate-500">
                      {currencyFormatter.format(category.inventoryValue || 0)}
                    </p>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-slate-200">
                    <div
                      className="h-2 rounded-full bg-slate-900"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  <p className="mt-3 text-sm text-slate-500">
                    {numberFormatter.format(category.itemCount)} items ·{" "}
                    {numberFormatter.format(category.quantity)} units
                  </p>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel
          title="Top Moving Materials"
          subtitle="Most active materials by combined inbound and outbound throughput."
        >
          <div className="space-y-3">
            {topMovingMaterials.map((material) => (
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
                  <p className="text-sm font-semibold text-slate-900">
                    {numberFormatter.format(material.throughput || 0)} total
                  </p>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <MiniMetric
                    label="Inbound"
                    value={numberFormatter.format(material.inbound || 0)}
                  />
                  <MiniMetric
                    label="Outbound"
                    value={numberFormatter.format(material.outbound || 0)}
                  />
                  <MiniMetric
                    label="Value"
                    value={currencyFormatter.format(material.inventoryValue || 0)}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.7fr_1.3fr]">
        <Panel
          title="Health Distribution"
          subtitle="Operational spread of current stock states."
        >
          <div className="space-y-3">
            <HealthRow label="Healthy" value={healthDistribution.healthy || 0} tone="bg-emerald-500" />
            <HealthRow label="Low" value={healthDistribution.low || 0} tone="bg-amber-500" />
            <HealthRow label="Critical" value={healthDistribution.critical || 0} tone="bg-rose-500" />
            <HealthRow label="Out" value={healthDistribution.out || 0} tone="bg-slate-700" />
          </div>
        </Panel>

        <Panel
          title="Recent Analytics Feed"
          subtitle="Latest movement entries available to the reporting layer."
        >
          <div className="space-y-3">
            {movementFeed.slice(0, 8).map((movement) => (
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
                        {movement.material}
                      </p>
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
              </div>
            ))}
          </div>
        </Panel>
      </section>
    </div>
  );
}

function MetricCard({ label, value, note }) {
  return (
    <article className="rounded-[28px] border border-slate-200 bg-white/88 px-5 py-5 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.28)]">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-slate-900">{value}</p>
      <p className="mt-3 text-sm leading-6 text-slate-500">{note}</p>
    </article>
  );
}

function AlertRow({ alert }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50/90 px-4 py-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold text-slate-900">{alert.title}</p>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
          {alert.severity}
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-600">{alert.message}</p>
    </div>
  );
}

function TrendBar({ label, value, maxValue, className }) {
  const width = Math.max(8, Math.round((value / maxValue) * 100));

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3 text-sm text-slate-500">
        <span>{label}</span>
        <span>{numberFormatter.format(value)}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-200">
        <div className={`h-2 rounded-full ${className}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function MiniMetric({ label, value }) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-white px-3 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function HealthRow({ label, value, tone }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50/90 px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold text-slate-900">{label}</p>
        <p className="text-sm text-slate-500">{numberFormatter.format(value)}</p>
      </div>
      <div className="mt-3 h-2 rounded-full bg-slate-200">
        <div className={`h-2 rounded-full ${tone}`} style={{ width: `${Math.max(8, value * 12)}%` }} />
      </div>
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
