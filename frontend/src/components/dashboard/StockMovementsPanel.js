"use client";

import { useCallback, useEffect, useState } from "react";
import Panel from "../ui/Panel";
import StatusMessage from "../ui/StatusMessage";
import { apiRequest, withAuth } from "../../lib/api";

const inFormInitial = { materialId: "", supplierId: "", stockInQuantity: "" };
const outFormInitial = { materialId: "", supplierId: "", stockOutQuantity: "" };

export default function StockMovementsPanel({
  token,
  materials,
  suppliers,
  onUnauthorized,
  onChange,
}) {
  const [stockIns, setStockIns] = useState([]);
  const [stockOuts, setStockOuts] = useState([]);
  const [stockInForm, setStockInForm] = useState(inFormInitial);
  const [stockOutForm, setStockOutForm] = useState(outFormInitial);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const setError = (message) => setStatus({ type: "error", message });
  const setSuccess = (message) => setStatus({ type: "success", message });

  const fetchMovements = useCallback(async () => {
    try {
      const [inData, outData] = await Promise.all([
        apiRequest("/stockIn", withAuth(token, { method: "GET" })),
        apiRequest("/stockOut", withAuth(token, { method: "GET" })),
      ]);
      setStockIns(inData);
      setStockOuts(outData);
    } catch (error) {
      if (error.status === 401) {
        onUnauthorized?.();
        return;
      }
      setError(error.message);
    }
  }, [onUnauthorized, token]);

  useEffect(() => {
    if (!token) return;
    queueMicrotask(() => {
      void fetchMovements();
    });
  }, [fetchMovements, token]);

  const submitStockIn = async (event) => {
    event.preventDefault();
    setBusy(true);
    setStatus({ type: "", message: "" });
    try {
      const data = await apiRequest(
        "/stockIn",
        withAuth(token, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            materialId: stockInForm.materialId,
            supplierId: stockInForm.supplierId,
            stockInQuantity: Number(stockInForm.stockInQuantity),
          }),
        }),
      );
      const created = data.stockIn || data;
      setStockIns((prev) => [created, ...prev]);
      setStockInForm(inFormInitial);
      setSuccess("Stock-in recorded.");
      onChange?.();
    } catch (error) {
      if (error.status === 401) {
        onUnauthorized?.();
        return;
      }
      setError(error.message);
    } finally {
      setBusy(false);
    }
  };

  const submitStockOut = async (event) => {
    event.preventDefault();
    setBusy(true);
    setStatus({ type: "", message: "" });
    try {
      const data = await apiRequest(
        "/stockOut",
        withAuth(token, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            materialId: stockOutForm.materialId,
            supplierId: stockOutForm.supplierId,
            stockOutQuantity: Number(stockOutForm.stockOutQuantity),
          }),
        }),
      );
      const created = data.stockOut || data;
      setStockOuts((prev) => [created, ...prev]);
      setStockOutForm(outFormInitial);
      setSuccess("Stock-out recorded.");
      onChange?.();
    } catch (error) {
      if (error.status === 401) {
        onUnauthorized?.();
        return;
      }
      setError(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel
      title="Stock Movements"
      subtitle="Track incoming and outgoing quantities"
      right={
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-[#b8c4e0]">
          In {stockIns.length} | Out {stockOuts.length}
        </span>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <form
          className="grid gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3"
          onSubmit={submitStockIn}
        >
          <h3 className="text-sm font-semibold text-emerald-200">Stock In</h3>
          <select
            className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
            value={stockInForm.materialId}
            onChange={(e) =>
              setStockInForm((prev) => ({ ...prev, materialId: e.target.value }))
            }
            required
          >
            <option value="">Select material</option>
            {materials.map((material) => (
              <option key={material._id} value={material._id}>
                {material.MaterialName}
              </option>
            ))}
          </select>
          <select
            className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
            value={stockInForm.supplierId}
            onChange={(e) =>
              setStockInForm((prev) => ({ ...prev, supplierId: e.target.value }))
            }
            required
          >
            <option value="">Select supplier</option>
            {suppliers.map((supplier) => (
              <option key={supplier._id} value={supplier._id}>
                {supplier.SupplierName}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
            placeholder="Quantity"
            value={stockInForm.stockInQuantity}
            onChange={(e) =>
              setStockInForm((prev) => ({
                ...prev,
                stockInQuantity: e.target.value,
              }))
            }
            required
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-emerald-300 px-3 py-2 text-sm font-semibold text-black disabled:opacity-60"
          >
            Record Stock In
          </button>
        </form>

        <form
          className="grid gap-2 rounded-xl border border-rose-500/30 bg-rose-500/5 p-3"
          onSubmit={submitStockOut}
        >
          <h3 className="text-sm font-semibold text-rose-200">Stock Out</h3>
          <select
            className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
            value={stockOutForm.materialId}
            onChange={(e) =>
              setStockOutForm((prev) => ({ ...prev, materialId: e.target.value }))
            }
            required
          >
            <option value="">Select material</option>
            {materials.map((material) => (
              <option key={material._id} value={material._id}>
                {material.MaterialName}
              </option>
            ))}
          </select>
          <select
            className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
            value={stockOutForm.supplierId}
            onChange={(e) =>
              setStockOutForm((prev) => ({ ...prev, supplierId: e.target.value }))
            }
            required
          >
            <option value="">Select supplier</option>
            {suppliers.map((supplier) => (
              <option key={supplier._id} value={supplier._id}>
                {supplier.SupplierName}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
            placeholder="Quantity"
            value={stockOutForm.stockOutQuantity}
            onChange={(e) =>
              setStockOutForm((prev) => ({
                ...prev,
                stockOutQuantity: e.target.value,
              }))
            }
            required
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-rose-300 px-3 py-2 text-sm font-semibold text-black disabled:opacity-60"
          >
            Record Stock Out
          </button>
        </form>
      </div>

      <StatusMessage status={status} />

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <h4 className="mb-2 text-sm font-semibold text-emerald-200">
            Recent Stock In
          </h4>
          <div className="space-y-2">
            {stockIns.slice(0, 6).map((row) => (
              <div
                key={row._id}
                className="rounded-lg border border-white/10 px-3 py-2 text-xs text-[#c8d3ef]"
              >
                {row.materialId?.MaterialName || row.materialId} |{" "}
                {row.stockInQuantity}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <h4 className="mb-2 text-sm font-semibold text-rose-200">
            Recent Stock Out
          </h4>
          <div className="space-y-2">
            {stockOuts.slice(0, 6).map((row) => (
              <div
                key={row._id}
                className="rounded-lg border border-white/10 px-3 py-2 text-xs text-[#c8d3ef]"
              >
                {row.materialId?.MaterialName || row.materialId} |{" "}
                {row.stockOutQuantity}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}
