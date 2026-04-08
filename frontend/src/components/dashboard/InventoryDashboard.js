"use client";

import { useCallback, useEffect, useState } from "react";
import { clearAuth, getStoredAuth } from "../../lib/auth";
import { apiRequest, withAuth } from "../../lib/api";
import RawMaterialsPanel from "./RawMaterialsPanel";
import StockMovementsPanel from "./StockMovementsPanel";
import SuppliersPanel from "./SuppliersPanel";

export default function InventoryDashboard({ onLogout }) {
  const [auth] = useState(() => getStoredAuth());
  const [suppliers, setSuppliers] = useState([]);
  const [materials, setMaterials] = useState([]);

  const handleUnauthorized = useCallback(() => {
    clearAuth();
    onLogout?.();
  }, [onLogout]);

  const refreshReferences = useCallback(async () => {
    if (!auth.token) return;
    try {
      const [supplierData, materialData] = await Promise.all([
        apiRequest("/suppliers", withAuth(auth.token, { method: "GET" })),
        apiRequest("/rawMaterial", withAuth(auth.token, { method: "GET" })),
      ]);
      setSuppliers(supplierData);
      setMaterials(materialData);
    } catch (error) {
      if (error.status === 401) {
        handleUnauthorized();
      }
    }
  }, [auth.token, handleUnauthorized]);

  useEffect(() => {
    if (!auth.token) return;
    queueMicrotask(() => {
      void refreshReferences();
    });
  }, [auth.token, refreshReferences]);

  const logout = () => {
    clearAuth();
    onLogout?.();
  };

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-white/10 bg-[#111728]/80 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[#91a0c5]">
              Protected Session
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-white">
              Inventory Control Room
            </h2>
            <p className="mt-1 text-sm text-[#98a5c8]">
              Signed in as {auth.user?.username || auth.user?.email || "User"}
            </p>
          </div>
          <button
            onClick={logout}
            className="rounded-xl border border-white/15 px-4 py-2 text-sm text-[#f5c45e]"
          >
            Log out
          </button>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <SuppliersPanel
          token={auth.token}
          onUnauthorized={handleUnauthorized}
          onChange={refreshReferences}
        />
        <RawMaterialsPanel
          token={auth.token}
          onUnauthorized={handleUnauthorized}
          onChange={refreshReferences}
        />
      </div>

      <StockMovementsPanel
        token={auth.token}
        suppliers={suppliers}
        materials={materials}
        onUnauthorized={handleUnauthorized}
        onChange={refreshReferences}
      />
    </div>
  );
}
