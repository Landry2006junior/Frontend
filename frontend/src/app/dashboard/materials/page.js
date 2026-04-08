"use client";

import { useRouter } from "next/navigation";
import ProtectedPageShell from "../../../components/dashboard/ProtectedPageShell";
import RawMaterialsPanel from "../../../components/dashboard/RawMaterialsPanel";
import { clearAuth, getStoredAuth } from "../../../lib/auth";

export default function MaterialsPage() {
  const router = useRouter();
  const { token } = getStoredAuth();

  const handleUnauthorized = () => {
    clearAuth();
    router.push("/login");
  };

  return (
    <ProtectedPageShell
      title="Raw Materials"
      subtitle="Create and update material stock details."
    >
      <RawMaterialsPanel token={token} onUnauthorized={handleUnauthorized} />
    </ProtectedPageShell>
  );
}
