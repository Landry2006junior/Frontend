"use client";

import { useCallback, useEffect, useState } from "react";
import Panel from "../ui/Panel";
import StatusMessage from "../ui/StatusMessage";
import { apiRequest, withAuth } from "../../lib/api";

export default function SuppliersPanel({ token, onUnauthorized, onChange }) {
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({ SupplierName: "", phoneNumber: "" });
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const setError = (message) => setStatus({ type: "error", message });
  const setSuccess = (message) => setStatus({ type: "success", message });

  const fetchSuppliers = useCallback(async () => {
    try {
      const data = await apiRequest(
        "/suppliers",
        withAuth(token, { method: "GET" }),
      );
      setSuppliers(data);
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
      void fetchSuppliers();
    });
  }, [fetchSuppliers, token]);

  const createSupplier = async (event) => {
    event.preventDefault();
    setBusy(true);
    setStatus({ type: "", message: "" });
    try {
      const data = await apiRequest(
        "/suppliers",
        withAuth(token, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            SupplierName: form.SupplierName.trim(),
            phoneNumber: form.phoneNumber.trim(),
          }),
        }),
      );
      const created = data.supplier || data;
      setSuppliers((prev) => [created, ...prev]);
      setForm({ SupplierName: "", phoneNumber: "" });
      setSuccess("Supplier created.");
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
    <Panel title="Suppliers" subtitle="Manage supplier records" right={<span className="rounded-full bg-white/10 px-3 py-1 text-xs text-[#b8c4e0]">{suppliers.length} total</span>}>
      <form className="grid gap-3 md:grid-cols-3" onSubmit={createSupplier}>
        <input
          className="rounded-xl border border-white/15 bg-black/25 px-3 py-2 text-sm text-white outline-none focus:border-[#6df4c4]"
          placeholder="Supplier Name"
          value={form.SupplierName}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, SupplierName: e.target.value }))
          }
          required
        />
        <input
          className="rounded-xl border border-white/15 bg-black/25 px-3 py-2 text-sm text-white outline-none focus:border-[#6df4c4]"
          placeholder="Phone Number"
          value={form.phoneNumber}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, phoneNumber: e.target.value }))
          }
          required
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-xl bg-[#f5c45e] px-3 py-2 text-sm font-semibold text-black disabled:opacity-60"
        >
          {busy ? "Saving..." : "Create Supplier"}
        </button>
      </form>
      <StatusMessage status={status} />
      <div className="mt-4 space-y-2">
        {suppliers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/20 px-4 py-5 text-sm text-[#98a5c8]">
            No suppliers yet.
          </div>
        ) : (
          suppliers.map((supplier) => (
            <article
              key={supplier._id}
              className="rounded-xl border border-white/10 bg-black/20 px-4 py-3"
            >
              <h3 className="font-medium text-white">{supplier.SupplierName}</h3>
              <p className="text-sm text-[#98a5c8]">{supplier.phoneNumber}</p>
            </article>
          ))
        )}
      </div>
    </Panel>
  );
}
