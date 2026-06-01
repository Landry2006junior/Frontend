import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen px-4 py-5 md:px-6 xl:px-8">
      <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-5">
        <header className="rounded-[34px] border border-slate-200 bg-white/88 px-6 py-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.28)] backdrop-blur">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.32em] text-slate-400">
                Inventory Command Platform
              </p>
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-slate-900 md:text-6xl">
                Build inventory workflows around decisions, not decoration.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-500 md:text-lg">
                Arc Inventory now centers operations around a live command
                dashboard, traceable product records, scan-assisted movement
                entry, supplier coverage, and analytics that reflect real stock
                conditions.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 xl:w-[430px]">
              <MetricCard label="Alerts" value="Automated" note="Reorder, low stock, and quarantine notifications" />
              <MetricCard label="Traceability" value="Scan-ready" note="Barcode and RFID-aware product records" />
              <MetricCard label="Views" value="Role-based" note="Operator, manager, and admin workflows" />
            </div>
          </div>
        </header>

        <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[34px] border border-slate-200 bg-[#142235] px-6 py-6 text-white shadow-[0_24px_70px_-40px_rgba(15,23,42,0.6)]">
            <p className="text-xs uppercase tracking-[0.32em] text-slate-400">
              Production-Oriented Features
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <FeatureCard label="Centralized Dashboard" />
              <FeatureCard label="Inventory Listings with Search / Filters" />
              <FeatureCard label="Product Detail Pages" />
              <FeatureCard label="Reporting & Analytics Panel" />
              <FeatureCard label="Real-Time Indicators" />
              <FeatureCard label="Barcode / RFID Integration" />
              <FeatureCard label="Automated Alert Notifications" />
              <FeatureCard label="Role-Based Views" />
              <FeatureCard label="Efficient Data Entry" />
              <FeatureCard label="Visual Feedback" />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900"
                href="/login"
              >
                Sign in
              </Link>
              <Link
                className="rounded-2xl border border-white/15 px-4 py-3 text-sm font-semibold text-white"
                href="/register"
              >
                Create account
              </Link>
              <Link
                className="rounded-2xl border border-white/15 px-4 py-3 text-sm font-semibold text-white"
                href="/dashboard"
              >
                Open workspace
              </Link>
            </div>
          </div>

          <div className="grid gap-5">
            <div className="rounded-[34px] border border-slate-200 bg-white/88 px-6 py-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.28)]">
              <p className="text-xs uppercase tracking-[0.32em] text-slate-400">
                API Surface
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <ApiChip label="/api/auth" />
                <ApiChip label="/api/rawMaterial" />
                <ApiChip label="/api/suppliers" />
                <ApiChip label="/api/stockIn" />
                <ApiChip label="/api/stockOut" />
                <ApiChip label="/api/reports" />
              </div>
              <p className="mt-5 text-sm leading-6 text-slate-500">
                Protected routes are backed by JWT auth, enriched inventory
                metadata, movement capture modes, and role-aware reporting.
              </p>
            </div>

            <div className="rounded-[34px] border border-slate-200 bg-white/88 px-6 py-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.28)]">
              <p className="text-xs uppercase tracking-[0.32em] text-slate-400">
                Workspace Intent
              </p>
              <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
                Professional inventory operations with real logic behind every component.
              </p>
              <p className="mt-4 text-sm leading-6 text-slate-500">
                The UI is now shaped around utility: scan lookup, traceability,
                filterable inventory, replenishment alerts, role-driven access,
                and analytics derived from live inventory and movement data.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function MetricCard({ label, value, note }) {
  return (
    <article className="rounded-[24px] border border-slate-200 bg-slate-50/90 px-4 py-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-3 text-xl font-semibold text-slate-900">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{note}</p>
    </article>
  );
}

function FeatureCard({ label }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/6 px-4 py-4 text-sm font-medium text-slate-100">
      {label}
    </div>
  );
}

function ApiChip({ label }) {
  return (
    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
      {label}
    </span>
  );
}
