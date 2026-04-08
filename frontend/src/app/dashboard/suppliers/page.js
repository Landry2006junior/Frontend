"use client";

import { useRouter } from "next/navigation";
import ProtectedPageShell from "../../../components/dashboard/ProtectedPageShell";
import SuppliersPanel from "../../../components/dashboard/SuppliersPanel";
import { clearAuth, getStoredAuth } from "../../../lib/auth";

export default function SuppliersPage() {
  const router = useRouter();
  const { token } = getStoredAuth();

  const handleUnauthorized = () => {
    clearAuth();
    router.push("/login");
  };

  return (
    <ProtectedPageShell
      title="Suppliers"
      subtitle="Manage partner records used for stock transactions."
    >
      <SuppliersPanel token={token} onUnauthorized={handleUnauthorized} />
    </ProtectedPageShell>
  );
}
