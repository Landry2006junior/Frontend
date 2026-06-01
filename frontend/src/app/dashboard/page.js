import ProtectedPageShell from "../../components/dashboard/ProtectedPageShell";
import InventoryDashboard from "../../components/dashboard/InventoryDashboard";

export default function DashboardHomePage() {
  return (
    <ProtectedPageShell
      title="Centralized Inventory Dashboard"
      subtitle="Monitor stock health, trace movement activity, action alerts, and role-specific priorities from one production-oriented command center."
    >
      <InventoryDashboard />
    </ProtectedPageShell>
  );
}
