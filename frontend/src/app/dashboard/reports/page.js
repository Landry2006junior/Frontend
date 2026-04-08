"use client";

import { useRouter } from "next/navigation";
import ProtectedPageShell from "../../../components/dashboard/ProtectedPageShell";
import ReportsPanel from "../../../components/dashboard/ReportsPanel";
import { clearAuth, getStoredAuth } from "../../../lib/auth";

export default function ReportsPage() {
  const router = useRouter();
  const { token } = getStoredAuth();

  const handleUnauthorized = () => {
    clearAuth();
    router.push("/login");
  };

  return (
    <ProtectedPageShell
      title="Reports"
      subtitle="Simple inventory summary and latest stock movements."
    >
      <ReportsPanel token={token} onUnauthorized={handleUnauthorized} />
    </ProtectedPageShell>
  );
}
