"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getStoredAuth } from "../../lib/auth";

export default function VaultPage() {
  const router = useRouter();
  const [hasToken] = useState(() => Boolean(getStoredAuth().token));

  useEffect(() => {
    if (!hasToken) {
      router.replace("/login");
      return;
    }
    router.replace("/dashboard");
  }, [hasToken, router]);

  if (!hasToken) {
    return (
      <div className="min-h-screen px-6 py-10 text-white md:px-16">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 rounded-[32px] border border-white/10 bg-[#121625]/80 p-10 text-center text-sm text-[#b7c3df]">
          Checking session...
          <Link className="underline underline-offset-4" href="/login">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-10 text-white md:px-16">
      <div className="rise-in mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-[#92a0bf]">
            Protected
          </p>
          <h1 className="text-4xl font-semibold md:text-5xl">
            Vault workspace
          </h1>
          <p className="text-base text-[#b7c3df]">
            Redirecting to organized dashboard pages...
          </p>
        </header>
      </div>
    </div>
  );
}
