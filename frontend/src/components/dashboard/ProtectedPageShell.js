"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearAuth, getStoredAuth } from "../../lib/auth";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/suppliers", label: "Suppliers" },
  { href: "/dashboard/materials", label: "Materials" },
  { href: "/dashboard/movements", label: "Movements" },
  { href: "/dashboard/reports", label: "Reports" },
];

export default function ProtectedPageShell({ title, subtitle, children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [auth] = useState(() => getStoredAuth());

  useEffect(() => {
    if (!auth.token) router.replace("/login");
  }, [auth.token, router]);

  const logout = () => {
    clearAuth();
    router.push("/login");
  };

  if (!auth.token) {
    return (
      <div className="min-h-screen px-6 py-10 text-white md:px-16">
        <div className="mx-auto max-w-4xl rounded-[28px] border border-white/10 bg-[#111728]/80 p-8 text-sm text-[#9aa6c8]">
          Checking session...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-10 text-white md:px-16">
      <div className="rise-in mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="rounded-[28px] border border-white/10 bg-[#111728]/80 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#91a0c5]">
                Protected Dashboard
              </p>
              <h1 className="mt-1 text-3xl font-semibold md:text-4xl">{title}</h1>
              <p className="mt-1 text-sm text-[#9aa6c8]">{subtitle}</p>
            </div>
            <button
              onClick={logout}
              className="rounded-xl border border-white/15 px-4 py-2 text-sm text-[#f5c45e]"
            >
              Log out
            </button>
          </div>
          <nav className="mt-4 flex flex-wrap gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl px-3 py-2 text-sm ${
                  pathname === item.href
                    ? "bg-[#f5c45e] text-black"
                    : "border border-white/15 text-[#c8d3ef]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        {children}
      </div>
    </div>
  );
}
