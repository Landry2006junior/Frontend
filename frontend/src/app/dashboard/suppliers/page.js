import ProtectedPageShell from "../../../components/dashboard/ProtectedPageShell";
import SuppliersPanel from "../../../components/dashboard/SuppliersPanel";

export default function SuppliersPage() {
  return (
    <ProtectedPageShell
      title="Supplier Workspace"
      subtitle="Manage supplier partners, monitor assignment coverage, and close sourcing gaps across inventory."
    >
      <SuppliersPanel />
    </ProtectedPageShell>
  );
}
