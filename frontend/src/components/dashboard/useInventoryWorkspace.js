"use client";

import { startTransition, useEffect, useEffectEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, withAuth } from "../../lib/api";
import { clearAuth, getStoredAuth } from "../../lib/auth";
import { getRoleConfig } from "../../lib/inventory";

const EMPTY_AUTH = { token: "", user: null };

export function useInventoryWorkspace({
  materialId = "",
  autoRefreshMs = 45000,
} = {}) {
  const router = useRouter();
  const [auth, setAuth] = useState(EMPTY_AUTH);
  const [materials, setMaterials] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [stockIns, setStockIns] = useState([]);
  const [stockOuts, setStockOuts] = useState([]);
  const [report, setReport] = useState(null);
  const [reportBlocked, setReportBlocked] = useState(false);
  const [materialDetail, setMaterialDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");
  const [lastSyncedAt, setLastSyncedAt] = useState(null);

  const handleUnauthorized = useEffectEvent(() => {
    clearAuth();
    setAuth(EMPTY_AUTH);
    router.replace("/login");
  });

  const fetchReportPayload = useEffectEvent(async (token, canViewReports) => {
    if (!canViewReports) {
      return { data: null, blocked: true };
    }

    try {
      const data = await apiRequest("/reports", withAuth(token, { method: "GET" }));
      return { data, blocked: false };
    } catch (requestError) {
      if (requestError.status === 401) {
        handleUnauthorized();
        return { data: null, blocked: false };
      }

      if (requestError.status === 403) {
        return { data: null, blocked: true };
      }

      throw requestError;
    }
  });

  const loadMaterialDetail = useEffectEvent(async (id, token) => {
    if (!id || !token) {
      setMaterialDetail(null);
      return;
    }

    try {
      const data = await apiRequest(
        `/rawMaterial/${id}`,
        withAuth(token, { method: "GET" }),
      );
      setMaterialDetail(data);
    } catch (requestError) {
      if (requestError.status === 401) {
        handleUnauthorized();
        return;
      }

      if (requestError.status === 404) {
        setMaterialDetail(null);
        return;
      }

      setError(requestError.message);
    }
  });

  const syncWorkspace = useEffectEvent(
    async ({ background = false, refreshDetail = Boolean(materialId) } = {}) => {
      const session = getStoredAuth();

      if (!session.token) {
        handleUnauthorized();
        return;
      }

      const roleConfig = getRoleConfig(session.user?.role);

      setAuth(session);
      setError("");

      if (background) {
        setSyncing(true);
      } else {
        setLoading(true);
      }

      try {
        const [materialsData, suppliersData, stockInsData, stockOutsData] =
          await Promise.all([
            apiRequest("/rawMaterial", withAuth(session.token, { method: "GET" })),
            apiRequest("/suppliers", withAuth(session.token, { method: "GET" })),
            apiRequest("/stockIn", withAuth(session.token, { method: "GET" })),
            apiRequest("/stockOut", withAuth(session.token, { method: "GET" })),
          ]);

        const reportPayload = await fetchReportPayload(
          session.token,
          roleConfig.permissions.canViewReports,
        );

        startTransition(() => {
          setMaterials(materialsData);
          setSuppliers(suppliersData);
          setStockIns(stockInsData);
          setStockOuts(stockOutsData);
          setReport(reportPayload.data);
          setReportBlocked(reportPayload.blocked);
          setLastSyncedAt(new Date().toISOString());
        });

        if (refreshDetail && materialId) {
          await loadMaterialDetail(materialId, session.token);
        }
      } catch (requestError) {
        if (requestError.status === 401) {
          handleUnauthorized();
          return;
        }

        setError(requestError.message || "Unable to refresh workspace.");
      } finally {
        setLoading(false);
        setSyncing(false);
      }
    },
  );

  useEffect(() => {
    const session = getStoredAuth();
    setAuth(session);

    if (!session.token) {
      router.replace("/login");
      return;
    }

    void syncWorkspace({
      background: false,
      refreshDetail: Boolean(materialId),
    });

    if (autoRefreshMs <= 0) {
      return;
    }

    const interval = window.setInterval(() => {
      void syncWorkspace({
        background: true,
        refreshDetail: Boolean(materialId),
      });
    }, autoRefreshMs);

    return () => window.clearInterval(interval);
  }, [autoRefreshMs, materialId, router]);

  useEffect(() => {
    if (!auth.token || !materialId) {
      return;
    }

    void loadMaterialDetail(materialId, auth.token);
  }, [auth.token, materialId]);

  const role = auth.user?.role || "manager";
  const roleConfig = getRoleConfig(role);

  const request = async (
    path,
    options,
    { refreshDetail = Boolean(materialId) } = {},
  ) => {
    if (!auth.token) {
      handleUnauthorized();
      throw new Error("Session expired.");
    }

    const data = await apiRequest(path, withAuth(auth.token, options));
    await syncWorkspace({ background: true, refreshDetail });
    return data;
  };

  return {
    auth,
    role,
    roleConfig,
    permissions: roleConfig.permissions,
    materials,
    suppliers,
    stockIns,
    stockOuts,
    report,
    reportBlocked,
    materialDetail,
    loading,
    syncing,
    error,
    lastSyncedAt,
    refresh: () =>
      syncWorkspace({ background: true, refreshDetail: Boolean(materialId) }),
    createSupplier: (payload) =>
      request("/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    saveMaterial: (payload, id = "") =>
      request(
        id ? `/rawMaterial/${id}` : "/rawMaterial",
        {
          method: id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
        { refreshDetail: Boolean(materialId) || Boolean(id) },
      ),
    recordMovement: (direction, payload) =>
      request(`/stock${direction === "in" ? "In" : "Out"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    loadMaterialDetail: (id) => loadMaterialDetail(id, auth.token),
    clearSession: handleUnauthorized,
  };
}
