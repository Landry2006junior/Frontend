import ProtectedPageShell from "../../../components/dashboard/ProtectedPageShell";
import StockMovementsPanel from "../../../components/dashboard/StockMovementsPanel";

export default function MovementsPage() {
  return (
    <ProtectedPageShell
      title="Movement Console"
      subtitle="Receive, issue, and verify inventory with scan-assisted workflows and immediate visual feedback."
    >
      <StockMovementsPanel />
    </ProtectedPageShell>
  );
}
