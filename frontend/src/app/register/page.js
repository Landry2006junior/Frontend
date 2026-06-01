"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthForm from "../../components/AuthForm";

export default function RegisterPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen px-4 py-5 md:px-6 xl:px-8">
      <div className="mx-auto grid w-full max-w-[1260px] gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[34px] border border-slate-200 bg-[#142235] px-6 py-6 text-white shadow-[0_24px_70px_-40px_rgba(15,23,42,0.6)]">
          <p className="text-xs uppercase tracking-[0.32em] text-slate-400">
            Create Access
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            Set up a role-aware workspace account
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
            Choose the right operating role up front so the dashboard, analytics
            access, supplier management, and movement workflows align with the
            job to be done.
          </p>
          <div className="mt-6 grid gap-3">
            <InfoTile
              title="Admin"
              description="Full visibility and control across inventory, suppliers, and analytics."
            />
            <InfoTile
              title="Manager / Operator"
              description="Support either planning-led inventory control or floor-focused movement execution."
            />
          </div>
        </section>

        <section className="rounded-[34px] border border-slate-200 bg-white/88 px-6 py-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.28)] backdrop-blur">
          <div className="max-w-lg">
            <p className="text-xs uppercase tracking-[0.32em] text-slate-400">
              Register
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
              Create your Arc Inventory account
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              New users can choose a role that unlocks the right workflow for
              inventory maintenance, movement capture, or reporting.
            </p>
          </div>

          <div className="mt-6">
            <AuthForm mode="register" onSuccess={() => router.push("/dashboard")} />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
            <Link className="underline underline-offset-4" href="/login">
              Already have access? Sign in
            </Link>
            <Link className="underline underline-offset-4" href="/">
              Back to overview
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function InfoTile({ title, description }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/6 px-4 py-4">
      <p className="font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
    </div>
  );
}
