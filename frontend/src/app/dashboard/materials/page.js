import ProtectedPageShell from "../../../components/dashboard/ProtectedPageShell";
import RawMaterialsPanel from "../../../components/dashboard/RawMaterialsPanel";

export default function MaterialsPage() {
  return (
    <ProtectedPageShell
      title="Inventory Listings"
      subtitle="Search, filter, maintain, and inspect inventory records with traceability-aware product data."
    >
      <RawMaterialsPanel />
    </ProtectedPageShell>
  );
}
