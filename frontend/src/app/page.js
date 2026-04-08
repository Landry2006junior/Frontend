import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen px-6 py-10 text-white md:px-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-[#92a0bf]">
              Secure Inventory
            </p>
            <h1 className="max-w-xl font-[450] text-4xl leading-tight md:text-5xl">
              Arc Inventory
              <span className="font-serif text-[#f6c453]">
                {" "}
                control with protected APIs.
              </span>
            </h1>
            <p className="max-w-xl text-base text-[#b7c3df] md:text-lg">
              Authenticate, then manage suppliers, raw materials, stock-in, and
              stock-out in one modular workspace.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-[#b7c3df]">
            <span className="rounded-full bg-[#1a2237] px-3 py-1">
              API: /api/auth
            </span>
            <span className="rounded-full bg-[#1a2237] px-3 py-1">API: /api/suppliers</span>
            <span className="rounded-full bg-[#1a2237] px-3 py-1">API: /api/rawMaterial</span>
            <span className="rounded-full bg-[#1a2237] px-3 py-1">API: /api/stockIn + /api/stockOut</span>
            <span className="rounded-full bg-[#1a2237] px-3 py-1">
              JWT Guarded
            </span>
          </div>
        </header>

        <section className="rise-in grid gap-6 md:grid-cols-3">
          <div className="rounded-[28px] border border-white/10 bg-[#121625]/80 p-6 shadow-[0_30px_120px_-60px_rgba(246,196,83,0.6)] backdrop-blur">
            <h2 className="text-xl font-semibold">Login</h2>
            <p className="mt-3 text-sm text-[#b7c3df]">
              Sign in to access protected inventory routes.
            </p>
            <Link
              className="mt-6 inline-flex rounded-2xl bg-[#f6c453] px-4 py-2 text-sm font-semibold text-black"
              href="/login"
            >
              Go to login
            </Link>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h2 className="text-xl font-semibold">Register</h2>
            <p className="mt-3 text-sm text-[#b7c3df]">
              Create an account and receive JWT auth.
            </p>
            <Link
              className="mt-6 inline-flex rounded-2xl border border-white/20 px-4 py-2 text-sm font-semibold text-white"
              href="/register"
            >
              Create account
            </Link>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-black/30 p-6 backdrop-blur">
            <h2 className="text-xl font-semibold">Protected Dashboard</h2>
            <p className="mt-3 text-sm text-[#b7c3df]">
              Manage suppliers and stock operations (auth required).
            </p>
            <Link
              className="mt-6 inline-flex rounded-2xl border border-[#69f0c6]/40 px-4 py-2 text-sm font-semibold text-[#69f0c6]"
              href="/dashboard"
            >
              Open vault
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
