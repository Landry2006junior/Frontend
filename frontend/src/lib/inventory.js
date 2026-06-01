export const ROLE_CONFIG = {
  admin: {
    label: "Administrator",
    accent: "rose",
    description: "Owns master data, supplier governance, and executive reporting.",
    permissions: {
      canManageMaterials: true,
      canManageSuppliers: true,
      canViewReports: true,
      canRecordMovements: true,
    },
  },
  manager: {
    label: "Operations Manager",
    accent: "amber",
    description: "Balances replenishment, stock health, and throughput targets.",
    permissions: {
      canManageMaterials: true,
      canManageSuppliers: true,
      canViewReports: true,
      canRecordMovements: true,
    },
  },
  operator: {
    label: "Floor Operator",
    accent: "teal",
    description: "Executes scan-first receiving and issuing workflows on the floor.",
    permissions: {
      canManageMaterials: false,
      canManageSuppliers: false,
      canViewReports: false,
      canRecordMovements: true,
    },
  },
};

export const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

export const wholeCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const numberFormatter = new Intl.NumberFormat("en-US");

export const compactNumberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export function getRoleConfig(role) {
  return ROLE_CONFIG[role] || ROLE_CONFIG.manager;
}

export function getMaterialState(material) {
  if (material?.stockState) {
    return material.stockState;
  }

  const quantity = toNumber(material?.Quantity, 0);
  const safetyStock = toNumber(material?.safetyStock, 0);
  const reorderPoint = toNumber(material?.reorderPoint, 0);

  if (quantity <= 0) {
    return "out";
  }

  if (quantity <= safetyStock) {
    return "critical";
  }

  if (quantity <= reorderPoint) {
    return "low";
  }

  return "healthy";
}

export function getMaterialStateMeta(state) {
  const states = {
    healthy: {
      label: "Healthy",
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
    },
    low: {
      label: "Low",
      className:
        "border-amber-200 bg-amber-50 text-amber-700 ring-1 ring-amber-100",
    },
    critical: {
      label: "Critical",
      className:
        "border-rose-200 bg-rose-50 text-rose-700 ring-1 ring-rose-100",
    },
    out: {
      label: "Out",
      className:
        "border-slate-300 bg-slate-100 text-slate-700 ring-1 ring-slate-200",
    },
  };

  return states[state] || states.healthy;
}

export function buildClientAlerts(materials) {
  return materials
    .filter((material) => {
      const state = getMaterialState(material);
      return state !== "healthy" || material.status === "quarantined";
    })
    .map((material) => {
      const state = getMaterialState(material);

      if (material.status === "quarantined") {
        return {
          id: material._id,
          severity: "critical",
          title: `${material.MaterialName} is quarantined`,
          message: "Hold outbound movement until the batch clears inspection.",
          materialId: material._id,
        };
      }

      if (state === "out") {
        return {
          id: material._id,
          severity: "critical",
          title: `${material.MaterialName} is out of stock`,
          message: `Replenish at least ${Math.max(
            toNumber(material.reorderPoint, 0),
            1,
          )} ${material.Unit}.`,
          materialId: material._id,
        };
      }

      if (state === "critical") {
        return {
          id: material._id,
          severity: "high",
          title: `${material.MaterialName} is below safety stock`,
          message: `Current balance is ${material.Quantity} ${material.Unit}.`,
          materialId: material._id,
        };
      }

      return {
        id: material._id,
        severity: "medium",
        title: `${material.MaterialName} is nearing reorder`,
        message: `Top up before quantity drops below ${material.reorderPoint}.`,
        materialId: material._id,
      };
    });
}

export function buildSummary({ materials, suppliers, stockIns, stockOuts }) {
  const totalQuantity = materials.reduce(
    (sum, material) => sum + toNumber(material.Quantity, 0),
    0,
  );
  const totalInventoryValue = materials.reduce(
    (sum, material) =>
      sum + toNumber(material.Quantity, 0) * toNumber(material.UnitPrice, 0),
    0,
  );
  const totalStockIn = stockIns.reduce(
    (sum, row) => sum + toNumber(row.stockInQuantity, 0),
    0,
  );
  const totalStockOut = stockOuts.reduce(
    (sum, row) => sum + toNumber(row.stockOutQuantity, 0),
    0,
  );
  const lowStockCount = materials.filter((material) => {
    const state = getMaterialState(material);
    return state === "low" || state === "critical";
  }).length;
  const criticalCount = materials.filter(
    (material) => getMaterialState(material) === "critical",
  ).length;
  const outOfStockCount = materials.filter(
    (material) => getMaterialState(material) === "out",
  ).length;
  const alertCount = buildClientAlerts(materials).length;
  const scanReadyCount = materials.filter(
    (material) => material.barcode || material.rfidTag,
  ).length;

  return {
    materialCount: materials.length,
    supplierCount: suppliers.length,
    totalQuantity,
    totalInventoryValue,
    totalStockIn,
    totalStockOut,
    lowStockCount,
    criticalCount,
    outOfStockCount,
    alertCount,
    scanReadyCount,
  };
}

export function buildMovementFeed(stockIns, stockOuts) {
  return [
    ...stockIns.map((row) => ({
      id: row._id,
      type: "IN",
      quantity: row.stockInQuantity,
      date: row.stockInDate,
      material: row.materialId?.MaterialName || "Unknown material",
      supplier: row.supplierId?.SupplierName || "Unknown supplier",
      captureMode: row.captureMode || "manual",
      referenceCode: row.referenceCode || "",
      actor:
        row.createdBy?.username || row.createdBy?.email || "System operator",
    })),
    ...stockOuts.map((row) => ({
      id: row._id,
      type: "OUT",
      quantity: row.stockOutQuantity,
      date: row.stockOutDate,
      material: row.materialId?.MaterialName || "Unknown material",
      supplier: row.supplierId?.SupplierName || "Unknown supplier",
      captureMode: row.captureMode || "manual",
      referenceCode: row.referenceCode || "",
      actor:
        row.createdBy?.username || row.createdBy?.email || "System operator",
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function buildCategoryBreakdown(materials) {
  const buckets = new Map();

  materials.forEach((material) => {
    const key = material.category || "General";
    const bucket = buckets.get(key) || {
      category: key,
      itemCount: 0,
      quantity: 0,
      inventoryValue: 0,
    };

    bucket.itemCount += 1;
    bucket.quantity += toNumber(material.Quantity, 0);
    bucket.inventoryValue +=
      toNumber(material.Quantity, 0) * toNumber(material.UnitPrice, 0);
    buckets.set(key, bucket);
  });

  return Array.from(buckets.values()).sort(
    (a, b) => b.inventoryValue - a.inventoryValue,
  );
}

export function buildTopMovingMaterials(materials, stockIns, stockOuts) {
  const inboundMap = new Map();
  const outboundMap = new Map();

  stockIns.forEach((row) => {
    const key = row.materialId?._id || row.materialId;
    inboundMap.set(key, (inboundMap.get(key) || 0) + toNumber(row.stockInQuantity, 0));
  });

  stockOuts.forEach((row) => {
    const key = row.materialId?._id || row.materialId;
    outboundMap.set(
      key,
      (outboundMap.get(key) || 0) + toNumber(row.stockOutQuantity, 0),
    );
  });

  return [...materials]
    .map((material) => {
      const inbound = inboundMap.get(material._id) || 0;
      const outbound = outboundMap.get(material._id) || 0;

      return {
        id: material._id,
        MaterialName: material.MaterialName,
        sku: material.sku || "Unassigned",
        stockState: getMaterialState(material),
        inventoryValue:
          toNumber(material.inventoryValue, NaN) ||
          toNumber(material.Quantity, 0) * toNumber(material.UnitPrice, 0),
        inbound,
        outbound,
        throughput: inbound + outbound,
      };
    })
    .sort((a, b) => b.throughput - a.throughput)
    .slice(0, 5);
}

export function findMaterialByCode(materials, value) {
  const needle = value.trim().toUpperCase();

  if (!needle) {
    return null;
  }

  return (
    materials.find((material) => {
      const codes = [material.sku, material.barcode, material.rfidTag]
        .filter(Boolean)
        .map((entry) => entry.toUpperCase());
      return codes.includes(needle);
    }) || null
  );
}

export function normalizeMaterialPayload(form) {
  return {
    MaterialName: form.MaterialName.trim(),
    sku: form.sku.trim(),
    category: form.category.trim(),
    location: form.location.trim(),
    Quantity: Number(form.Quantity),
    Unit: form.Unit.trim(),
    UnitPrice: Number(form.UnitPrice),
    reorderPoint: Number(form.reorderPoint),
    safetyStock: Number(form.safetyStock),
    barcode: form.barcode.trim(),
    rfidTag: form.rfidTag.trim(),
    preferredSupplierId: form.preferredSupplierId,
    status: form.status,
    description: form.description.trim(),
    lastAuditDate: form.lastAuditDate,
  };
}
