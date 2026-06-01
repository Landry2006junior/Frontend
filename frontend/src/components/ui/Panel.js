export default function Panel({ title, subtitle, right, children }) {
  return (
    <section className="rounded-[30px] border border-slate-200/80 bg-white/88 p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.28)] backdrop-blur">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          {subtitle ? (
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          ) : null}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}
