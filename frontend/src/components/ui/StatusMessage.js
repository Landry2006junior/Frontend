export default function StatusMessage({ status }) {
  if (!status?.message) return null;

  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm ${
        status.type === "error"
          ? "border-rose-500/40 bg-rose-500/10 text-rose-200"
          : "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
      }`}
    >
      {status.message}
    </div>
  );
}
