"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Panel from "../ui/Panel";
import StatusMessage from "../ui/StatusMessage";
import { apiRequest, withAuth } from "../../lib/api";

const emptyCreate = {
  MaterialName: "",
  Quantity: "",
  Unit: "",
  UnitPrice: "",
};

export default function RawMaterialsPanel({ token, onUnauthorized, onChange }) {
  const [materials, setMaterials] = useState([]);
  const [createForm, setCreateForm] = useState(emptyCreate);
  const [updateForm, setUpdateForm] = useState({
    id: "",
    MaterialName: "",
    Quantity: "",
    Unit: "",
    UnitPrice: "",
  });
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const setError = (message) => setStatus({ type: "error", message });
  const setSuccess = (message) => setStatus({ type: "success", message });

  const materialsById = useMemo(() => {
    const map = new Map();
    materials.forEach((material) => map.set(material._id, material));
    return map;
  }, [materials]);

  const fetchMaterials = useCallback(async () => {
    try {
      const data = await apiRequest(
        "/rawMaterial",
        withAuth(token, { method: "GET" }),
      );
      setMaterials(data);
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
      void fetchMaterials();
    });
  }, [fetchMaterials, token]);

  const createMaterial = async (event) => {
    event.preventDefault();
    setBusy(true);
    setStatus({ type: "", message: "" });
    try {
      const data = await apiRequest(
        "/rawMaterial",
        withAuth(token, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            MaterialName: createForm.MaterialName.trim(),
            Quantity: Number(createForm.Quantity),
            Unit: createForm.Unit.trim(),
            UnitPrice: Number(createForm.UnitPrice),
          }),
        }),
      );
      const material = data.rawMaterial || data;
      setMaterials((prev) => [material, ...prev]);
      setCreateForm(emptyCreate);
      setSuccess("Raw material created.");
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

  const populateUpdate = (id) => {
    const selected = materialsById.get(id);
    if (!selected) return;
      setUpdateForm({
        id: selected._id,
        MaterialName: selected.MaterialName || "",
        Quantity: selected.Quantity?.toString() || "",
        Unit: selected.Unit || "",
        UnitPrice: selected.UnitPrice?.toString() || "",
      });
  };

  const updateMaterial = async (event) => {
    event.preventDefault();
    if (!updateForm.id) {
      setError("Pick a material first.");
      return;
    }
    setBusy(true);
    setStatus({ type: "", message: "" });
    try {
      const data = await apiRequest(
        `/rawMaterial/${updateForm.id}`,
        withAuth(token, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            MaterialName: updateForm.MaterialName.trim(),
            Quantity: Number(updateForm.Quantity),
            Unit: updateForm.Unit.trim(),
            UnitPrice: Number(updateForm.UnitPrice),
          }),
        }),
      );
      const updated = data.rawMaterial || data;
      setMaterials((prev) =>
        prev.map((material) => (material._id === updated._id ? updated : material)),
      );
      setSuccess("Raw material updated.");
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
      title="Raw Materials"
      subtitle="Create and update available material stock"
      right={
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-[#b8c4e0]">
          {materials.length} total
        </span>
      }
    >
      <form className="grid gap-3 md:grid-cols-5" onSubmit={createMaterial}>
        <input
          className="rounded-xl border border-white/15 bg-black/25 px-3 py-2 text-sm text-white outline-none focus:border-[#6df4c4]"
          placeholder="Material Name"
          value={createForm.MaterialName}
          onChange={(e) =>
            setCreateForm((prev) => ({ ...prev, MaterialName: e.target.value }))
          }
          required
        />
        <input
          type="number"
          className="rounded-xl border border-white/15 bg-black/25 px-3 py-2 text-sm text-white outline-none focus:border-[#6df4c4]"
          placeholder="Quantity"
          value={createForm.Quantity}
          onChange={(e) =>
            setCreateForm((prev) => ({ ...prev, Quantity: e.target.value }))
          }
          required
          min="0"
        />
        <input
          className="rounded-xl border border-white/15 bg-black/25 px-3 py-2 text-sm text-white outline-none focus:border-[#6df4c4]"
          placeholder="ItemsNumber"
          value={createForm.Unit}
          onChange={(e) =>
            setCreateForm((prev) => ({ ...prev, Unit: e.target.value }))
          }
          required
        />
        <input
          type="number"
          step="0.01"
          className="rounded-xl border border-white/15 bg-black/25 px-3 py-2 text-sm text-white outline-none focus:border-[#6df4c4]"
          placeholder="Price"
          value={createForm.UnitPrice}
          onChange={(e) =>
            setCreateForm((prev) => ({ ...prev, UnitPrice: e.target.value }))
          }
          required
          min="0"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-xl bg-[#f5c45e] px-3 py-2 text-sm font-semibold text-black disabled:opacity-60"
        >
          {busy ? "Saving..." : "Create Material"}
        </button>
      </form>

      <form className="mt-4 grid gap-3 rounded-xl border border-white/10 bg-black/20 p-3 md:grid-cols-6" onSubmit={updateMaterial}>
        <select
          className="rounded-xl border border-white/15 bg-black/25 px-3 py-2 text-sm text-white outline-none focus:border-[#f5c45e]"
          value={updateForm.id}
          onChange={(e) => {
            setUpdateForm((prev) => ({ ...prev, id: e.target.value }));
            populateUpdate(e.target.value);
          }}
        >
          <option value="">Pick material to update</option>
          {materials.map((material) => (
            <option key={material._id} value={material._id}>
              {material.MaterialName}
            </option>
          ))}
        </select>
        <input
          className="rounded-xl border border-white/15 bg-black/25 px-3 py-2 text-sm text-white outline-none focus:border-[#f5c45e]"
          placeholder="Name"
          value={updateForm.MaterialName}
          onChange={(e) =>
            setUpdateForm((prev) => ({ ...prev, MaterialName: e.target.value }))
          }
          required
        />
        <input
          type="number"
          className="rounded-xl border border-white/15 bg-black/25 px-3 py-2 text-sm text-white outline-none focus:border-[#f5c45e]"
          placeholder="Quantity"
          value={updateForm.Quantity}
          onChange={(e) =>
            setUpdateForm((prev) => ({ ...prev, Quantity: e.target.value }))
          }
          required
          min="0"
        />
        <input
          className="rounded-xl border border-white/15 bg-black/25 px-3 py-2 text-sm text-white outline-none focus:border-[#f5c45e]"
          placeholder="ItemsNumber"
          value={updateForm.Unit}
          onChange={(e) => setUpdateForm((prev) => ({ ...prev, Unit: e.target.value }))}
          required
        />
        <input
          type="number"
          step="0.01"
          className="rounded-xl border border-white/15 bg-black/25 px-3 py-2 text-sm text-white outline-none focus:border-[#f5c45e]"
          placeholder="Price"
          value={updateForm.UnitPrice}
          onChange={(e) =>
            setUpdateForm((prev) => ({ ...prev, UnitPrice: e.target.value }))
          }
          required
          min="0"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-xl border border-[#f5c45e]/40 px-3 py-2 text-sm font-semibold text-[#f5c45e] disabled:opacity-60"
        >
          Update
        </button>
      </form>

      <StatusMessage status={status} />

      <div className="mt-4 grid gap-2">
        {materials.map((material) => (
          <article
            key={material._id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2"
          >
            <div>
              <h3 className="font-medium text-white">{material.MaterialName}</h3>
              <p className="text-xs text-[#98a5c8]">
                Qty {material.Quantity} {material.Unit} | ${material.UnitPrice}
              </p>
            </div>
            <button
              type="button"
              onClick={() => populateUpdate(material._id)}
              className="rounded-lg border border-white/15 px-3 py-1 text-xs text-[#c9d3ec]"
            >
              Edit
            </button>
          </article>
        ))}
      </div>
    </Panel>
  );
}
