import Link from "next/link";
import ProtectedPageShell from "../../components/dashboard/ProtectedPageShell";

const modules = [
  {
    href: "/dashboard/suppliers",
    title: "Suppliers",
    desc: "Create and review supplier records used by stock movement entries.",
  },
  {
    href: "/dashboard/materials",
    title: "Raw Materials",
    desc: "Track materials and update quantity, unit, and unit price.",
  },
  {
    href: "/dashboard/movements",
    title: "Stock Movements",
    desc: "Record stock-in and stock-out against materials and suppliers.",
  },
  {
    href: "/dashboard/reports",
    title: "Reports",
    desc: "View summary metrics and recent inventory movement activity.",
  },
];

export default function DashboardHomePage() {
  return (
    <ProtectedPageShell
      title="Inventory Control Room"
      subtitle="All inventory routes are protected by backend JWT middleware."
    >
      <section className="grid gap-4 md:grid-cols-3">
        {modules.map((module) => (
          <article
            key={module.href}
            className="rounded-[24px] border border-white/10 bg-[#111728]/80 p-5"
          >
            <h2 className="text-xl font-semibold text-white">{module.title}</h2>
            <p className="mt-2 text-sm text-[#9aa6c8]">{module.desc}</p>
            <Link
              href={module.href}
              className="mt-4 inline-flex rounded-lg bg-[#f5c45e] px-3 py-2 text-sm font-semibold text-black"
            >
              Open module
            </Link>
          </article>
        ))}
      </section>
    </ProtectedPageShell>
  );
}
