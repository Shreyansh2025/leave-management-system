export default function Spinner({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-ink-400" role="status" aria-live="polite">
      <div className="h-5 w-5 border-2 border-ink-200 border-t-ink-600 rounded-full animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
