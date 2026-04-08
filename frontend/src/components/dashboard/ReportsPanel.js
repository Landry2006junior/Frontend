"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest, withAuth } from "../../lib/api";
import Panel from "../ui/Panel";
import StatusMessage from "../ui/StatusMessage";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

export default function ReportsPanel({ token, onUnauthorized }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: "", message: "" });

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setStatus({ type: "", message: "" });
    try {
      const data = await apiRequest("/reports", withAuth(token, { method: "GET" }));
      setReport(data);
    } catch (error) {
      if (error.status === 401) {
        onUnauthorized?.();
        return;
      }
      setStatus({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  }, [onUnauthorized, token]);

  useEffect(() => {
    if (!token) return;
    queueMicrotask(() => {
      void fetchReport();
    });
  }, [fetchReport, token]);

  const summary = report?.summary || {};
  const movements = report?.recentMovements || [];

  return (
    <Panel
      title="Reports"
      subtitle="Quick summary of current inventory and latest stock activity"
      right={
        <button
          type="button"
          onClick={() => void fetchReport()}
          disabled={loading}
          className="rounded-lg border border-white/20 px-3 py-1 text-xs text-[#c8d3ef] disabled:opacity-60"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Materials" value={summary.materialCount ?? 0} />
        <MetricCard label="Suppliers" value={summary.supplierCount ?? 0} />
        <MetricCard label="Total Quantity" value={summary.totalQuantity ?? 0} />
        <MetricCard label="Stock In Total" value={summary.totalStockIn ?? 0} />
        <MetricCard label="Stock Out Total" value={summary.totalStockOut ?? 0} />
        <MetricCard
          label="Inventory Value"
          value={currency.format(summary.totalInventoryValue ?? 0)}
        />
      </div>

      <StatusMessage status={status} />

      <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3">
        <h3 className="text-sm font-semibold text-white">Recent Movements</h3>
        {loading ? (
          <p className="mt-2 text-sm text-[#98a5c8]">Loading report...</p>
        ) : movements.length === 0 ? (
          <p className="mt-2 text-sm text-[#98a5c8]">No movements recorded yet.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {movements.map((row) => (
              <div
                key={`${row.type}-${row.id}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-[#c8d3ef]"
              >
                <span className={row.type === "IN" ? "text-emerald-200" : "text-rose-200"}>
                  {row.type}
                </span>
                <span>{row.material}</span>
                <span>{row.supplier}</span>
                <span>Qty {row.quantity}</span>
                <span>{new Date(row.date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Panel>
  );
}

function MetricCard({ label, value }) {
  return (
    <article className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.16em] text-[#98a5c8]">{label}</p>
      <p className="mt-1 text-xl font-semibold text-white">{value}</p>
    </article>
  );
}
