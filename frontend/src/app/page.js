"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { BarChart3, Boxes, FileText, Package, ShieldCheck, Truck, Warehouse } from "lucide-react";

export default function Home() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_-10%,rgba(56,189,248,0.18),transparent_60%),radial-gradient(900px_500px_at_10%_20%,rgba(59,130,246,0.16),transparent_60%),radial-gradient(900px_500px_at_90%_10%,rgba(99,102,241,0.16),transparent_60%),linear-gradient(180deg,#0b1026_0%,#101a33_40%,#0b1026_100%)]" />
        <Image
          src="/Arc%20inventory%20logo.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center opacity-[0.14] mix-blend-screen"
          priority
        />
        <div className="absolute inset-0 bg-[#0b1026]/20" />
        <div className="absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-[140px]" />
        <div className="absolute top-1/4 -left-32 h-[360px] w-[360px] rounded-full bg-blue-500/12 blur-[130px]" />
        <div className="absolute -bottom-40 right-[-8%] h-[460px] w-[460px] rounded-full bg-indigo-500/12 blur-[150px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1380px] flex-col gap-12 px-4 py-6 md:px-6 xl:px-8">
        <header className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-2 shadow-[0_30px_80px_-50px_rgba(56,189,248,0.9)] backdrop-blur">
              <Image
                src="/Arc%20inventory%20logo.png"
                alt="Arc Inventory Logo"
                width={48}
                height={48}
                className="h-12 w-12 object-contain"
                priority
              />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.4em] text-cyan-200">
                Arc Inventory
              </p>
              <p className="text-xs text-slate-300">
                Smart Warehouse Management System
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push("/login")}
            className="rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_25px_70px_-40px_rgba(59,130,246,0.95)] transition hover:brightness-110"
          >
            Sign In
          </button>
        </header>

        <section className="flex flex-col items-center gap-6 text-center">
          <span className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-1 text-xs font-medium uppercase tracking-[0.32em] text-cyan-200">
            Intelligent Inventory Control
          </span>
          <h1 className="max-w-5xl text-4xl font-semibold leading-tight tracking-tight text-white md:text-6xl lg:text-7xl">
            Smarter Stock Management for a More Efficient Warehouse
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
            Arc Inventory helps you track, monitor, and optimize your stock in
            real time. Gain full visibility, prevent shortages, and drive
            smarter decisions across your entire warehouse.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-8 py-3 text-sm font-semibold text-white shadow-[0_35px_90px_-45px_rgba(59,130,246,1)] transition hover:brightness-110"
          >
            Sign In to Get Started
          </button>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Boxes className="h-5 w-5" />}
            title="100% Visibility"
            subtitle="Track every item in real time"
          />
          <StatCard
            icon={<BarChart3 className="h-5 w-5" />}
            title="Real-time Tracking"
            subtitle="Live updates across all stock movements"
          />
          <StatCard
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Secure Access"
            subtitle="Role-based control for every user"
          />
          <StatCard
            icon={<Warehouse className="h-5 w-5" />}
            title="Always Available"
            subtitle="Reliable access to your inventory anytime"
          />
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<Package className="h-6 w-6" />}
            title="Inventory Management"
            description="Centralized control of raw materials with smart categorization and tracking."
          />
          <FeatureCard
            icon={<Truck className="h-6 w-6" />}
            title="Stock Movements"
            description="Effortlessly record stock in and stock out with full transaction history."
          />
          <FeatureCard
            icon={<Boxes className="h-6 w-6" />}
            title="Suppliers Management"
            description="Keep supplier records organized and linked to your stock operations."
          />
          <FeatureCard
            icon={<BarChart3 className="h-6 w-6" />}
            title="Reports & Analytics"
            description="Gain insights with visual reports to optimize purchasing and usage."
          />
          <FeatureCard
            icon={<FileText className="h-6 w-6" />}
            title="Product Traceability"
            description="Trace every item with barcode and RFID support for full accountability."
          />
          <FeatureCard
            icon={<ShieldCheck className="h-6 w-6" />}
            title="Role-Based Access"
            description="Secure workflows tailored to Operators, Managers, and Administrators."
          />
        </section>

        <section className="relative overflow-hidden rounded-[36px] border border-cyan-400/30 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-indigo-500/20 px-6 py-10 text-center shadow-[0_60px_140px_-80px_rgba(59,130,246,1)] backdrop-blur">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_200px_at_50%_0%,rgba(56,189,248,0.18),transparent_70%)]" />
          <div className="relative flex flex-col items-center gap-4">
            <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Take Control of Your Inventory Today
            </h2>
            <p className="max-w-2xl text-base text-slate-200">
              Streamline operations, eliminate guesswork, and keep your warehouse
              running at peak efficiency with Arc Inventory.
            </p>
            <button
              onClick={() => router.push("/login")}
              className="mt-2 rounded-2xl bg-white px-8 py-3 text-sm font-semibold text-slate-900 transition hover:brightness-95"
            >
              Sign In
            </button>
          </div>
        </section>

        <footer className="flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-sm text-slate-400 md:flex-row">
          <div className="flex items-center gap-2">
            <Image
              src="/Arc%20inventory%20logo.png"
              alt="Arc Inventory Logo"
              width={28}
              height={28}
              className="h-7 w-7 object-contain"
            />
            <span>Arc Inventory</span>
          </div>
          <p>© {new Date().getFullYear()} Arc Inventory. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

function StatCard({ icon, title, subtitle }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 px-5 py-5 backdrop-blur transition hover:border-cyan-400/40 hover:bg-white/8">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-gradient-to-br from-cyan-400/80 to-blue-500/80 p-2 text-white">
          {icon}
        </div>
        <div>
          <p className="text-lg font-semibold text-white">{title}</p>
          <p className="text-sm text-slate-300">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="rounded-[30px] border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:-translate-y-1 hover:border-cyan-400/40 hover:bg-white/8 hover:shadow-[0_40px_90px_-60px_rgba(56,189,248,0.9)]">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/80 to-blue-500/80 text-white">
        {icon}
      </div>
      <h3 className="mt-4 text-xl font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
    </div>
  );
}
