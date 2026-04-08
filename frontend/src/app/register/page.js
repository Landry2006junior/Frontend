"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthForm from "../../components/AuthForm";

export default function RegisterPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen px-6 py-10 text-white md:px-16">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <header className="space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-[#92a0bf]">
            Create Access
          </p>
          <h1 className="text-4xl font-semibold md:text-5xl">
            Register for Arc Inventory
          </h1>
          <p className="text-base text-[#b7c3df]">
            Register once and secure supplier/material/stock routes with JWT.
          </p>
        </header>

        <section className="rounded-[32px] border border-white/10 bg-[#121625]/80 p-8 shadow-[0_30px_120px_-60px_rgba(246,196,83,0.5)] backdrop-blur">
          <AuthForm
            mode="register"
            onSuccess={() => router.push("/dashboard")}
          />
        </section>

        <div className="flex flex-wrap items-center justify-between text-sm text-[#b7c3df]">
          <Link className="underline underline-offset-4" href="/login">
            Already have access? Sign in
          </Link>
          <Link className="underline underline-offset-4" href="/">
            Back to overview
          </Link>
        </div>
      </div>
    </div>
  );
}
