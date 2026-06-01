import ProtectedPageShell from "../../../components/dashboard/ProtectedPageShell";
import ReportsPanel from "../../../components/dashboard/ReportsPanel";

export default function ReportsPage() {
  return (
    <ProtectedPageShell
      title="Reporting & Analytics"
      subtitle="Track trends, category value, stock health, and automated inventory notifications."
    >
      <ReportsPanel />
    </ProtectedPageShell>
  );
}
