"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedPageShell from "../../../components/dashboard/ProtectedPageShell";
import StockMovementsPanel from "../../../components/dashboard/StockMovementsPanel";
import { apiRequest, withAuth } from "../../../lib/api";
import { clearAuth, getStoredAuth } from "../../../lib/auth";

export default function MovementsPage() {
  const router = useRouter();
  const [auth] = useState(() => getStoredAuth());
  const [suppliers, setSuppliers] = useState([]);
  const [materials, setMaterials] = useState([]);

  const handleUnauthorized = useCallback(() => {
    clearAuth();
    router.push("/login");
  }, [router]);

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
      if (error.status === 401) handleUnauthorized();
    }
  }, [auth.token, handleUnauthorized]);

  useEffect(() => {
    if (!auth.token) return;
    queueMicrotask(() => {
      void refreshReferences();
    });
  }, [auth.token, refreshReferences]);

  return (
    <ProtectedPageShell
      title="Stock Movements"
      subtitle="Record stock-in and stock-out with supplier/material relation."
    >
      <StockMovementsPanel
        token={auth.token}
        suppliers={suppliers}
        materials={materials}
        onUnauthorized={handleUnauthorized}
        onChange={refreshReferences}
      />
    </ProtectedPageShell>
  );
}
