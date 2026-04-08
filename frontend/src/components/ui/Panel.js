export default function Panel({ title, subtitle, right, children }) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-[#111728]/80 p-6 backdrop-blur">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-[#98a5c8]">{subtitle}</p> : null}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}
