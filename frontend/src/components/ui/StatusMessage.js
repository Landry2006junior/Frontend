export default function StatusMessage({ status }) {
  if (!status?.message) return null;

  const tone =
    status.type === "error"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : status.type === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-emerald-200 bg-emerald-50 text-emerald-700";

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${tone}`}>
      {status.message}
    </div>
  );
}
