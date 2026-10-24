"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearAuth, getStoredAuth } from "../../lib/auth";
import { dateFormatter, getRoleConfig } from "../../lib/inventory";

const navItems = [
  {
    href: "/dashboard",
    label: "Command Center",
    roles: ["admin", "manager", "operator"],
  },
  {
    href: "/dashboard/materials",
    label: "Inventory",
    roles: ["admin", "manager", "operator"],
  },
  {
    href: "/dashboard/movements",
    label: "Movements",
    roles: ["admin", "manager", "operator"],
  },
  {
    href: "/dashboard/reports",
    label: "Analytics",
    roles: ["admin", "manager"],
  },
  {
    href: "/dashboard/suppliers",
    label: "Suppliers",
    roles: ["admin", "manager"],
  },
];

export default function ProtectedPageShell({
  title,
  subtitle,
  actions,
  children,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [auth, setAuth] = useState({ token: "", user: null });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const session = getStoredAuth();
    setAuth(session);

    if (!session.token) {
      router.replace("/login");
    }
  }, [pathname, router]);

  const role = auth.user?.role || "manager";
  const roleConfig = getRoleConfig(role);
  const visibleNavItems = navItems.filter((item) => item.roles.includes(role));

  const logout = () => {
    clearAuth();
    router.push("/login");
  };

  if (!mounted || !auth.token) {
    return (
      <div className="min-h-screen px-4 py-6 md:px-8">
        <div className="mx-auto max-w-5xl rounded-[30px] border border-slate-200 bg-white/90 p-8 text-sm text-slate-500 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.28)]">
          Restoring secure workspace...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-5 md:px-6 xl:px-8">
      <div className="mx-auto grid w-full max-w-[1480px] gap-5 xl:grid-cols-[290px_minmax(0,1fr)]">
        <aside className="rounded-[34px] border border-slate-200 bg-[#142235] px-5 py-6 text-white shadow-[0_24px_70px_-40px_rgba(15,23,42,0.6)]">
          <div className="flex items-center justify-between gap-3 xl:block">
            <div>
              <p className="text-xs uppercase tracking-[0.34em] text-slate-400">
                Arc Inventory
              </p>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight">
                Warehouse Control
              </h1>
              <p className="mt-2 max-w-xs text-sm text-slate-300">
                Utility-first workspace for stock, suppliers, traceability, and
                movement operations.
              </p>
            </div>
            <button
              onClick={logout}
              className="rounded-2xl border border-white/15 px-4 py-2 text-sm text-slate-100 transition hover:border-white/35 xl:hidden"
            >
              Log out
            </button>
          </div>

          <div className="mt-6 rounded-[28px] border border-white/10 bg-white/6 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">
                  {auth.user?.username || auth.user?.email || "Team member"}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-400">
                  {roleConfig.label}
                </p>
              </div>
              <span className="rounded-full border border-white/12 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#f5c45e]">
                Active
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {roleConfig.description}
            </p>
            <div className="mt-4 grid gap-2 text-xs text-slate-300 sm:grid-cols-2 xl:grid-cols-1">
              <RolePoint
                enabled={roleConfig.permissions.canManageMaterials}
                label="Master data"
              />
              <RolePoint
                enabled={roleConfig.permissions.canManageSuppliers}
                label="Supplier admin"
              />
              <RolePoint
                enabled={roleConfig.permissions.canViewReports}
                label="Analytics access"
              />
              <RolePoint
                enabled={roleConfig.permissions.canRecordMovements}
                label="Live movement entry"
              />
            </div>
          </div>

          <nav className="mt-6 flex flex-wrap gap-2 xl:flex-col">
            {visibleNavItems.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/dashboard" &&
                  pathname?.startsWith(`${item.href}/`));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    // ensure navigation works reliably in client context
                    e.preventDefault();
                    router.push(item.href);
                  }}
                  className={`rounded-2xl px-4 py-3 text-sm transition ${
                    active
                      ? "bg-white text-slate-900 shadow-[0_16px_40px_-25px_rgba(255,255,255,0.7)]"
                      : "border border-white/10 bg-white/4 text-slate-200 hover:border-white/20 hover:bg-white/8"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 hidden rounded-[26px] border border-white/10 bg-[#0f1a29] p-4 xl:block">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Shift Pulse
            </p>
            <div className="mt-4 grid gap-3 text-sm">
              <MiniMetric
                label="Current role"
                value={roleConfig.label}
                tone="text-[#f5c45e]"
              />
              <MiniMetric
                label="Workspace date"
                value={mounted ? dateFormatter.format(new Date()) : "--"}
                tone="text-white"
              />
            </div>
            <button
              onClick={logout}
              className="mt-5 w-full rounded-2xl border border-white/12 px-4 py-3 text-sm text-slate-100 transition hover:border-white/25"
            >
              Log out
            </button>
          </div>
        </aside>

        <main className="space-y-5">
          <header className="rounded-[34px] border border-slate-200 bg-white/88 px-6 py-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.28)] backdrop-blur">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-slate-400">
                  Operational Workspace
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
                  {title}
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500 md:text-base">
                  {subtitle}
                </p>
              </div>
              {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
            </div>
          </header>

          <div className="rise-in space-y-5">{children}</div>
        </main>
      </div>
    </div>
  );
}

function RolePoint({ enabled, label }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-white/8 bg-white/4 px-3 py-2">
      <span
        className={`inline-flex h-2.5 w-2.5 rounded-full ${
          enabled ? "bg-emerald-300" : "bg-slate-500"
        }`}
      />
      <span>{label}</span>
    </div>
  );
}

function MiniMetric({ label, value, tone }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/4 px-3 py-3">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className={`mt-2 text-sm font-semibold ${tone}`}>{value}</p>
    </div>
  );
}
