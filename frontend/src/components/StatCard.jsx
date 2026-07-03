export default function StatCard({ label, value, accent = 'ink' }) {
  const accentMap = {
    ink: 'text-ink-700',
    marigold: 'text-marigold-600',
    approved: 'text-approved-600',
    rejected: 'text-rejected-600',
  };

  return (
    <div className="bg-white rounded-xl border border-ink-100 p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-400 mb-2">{label}</p>
      <p className={`font-display text-3xl font-semibold ${accentMap[accent]}`}>{value}</p>
    </div>
  );
}
