const STYLES = {
  Pending: 'bg-marigold-100 text-marigold-600',
  Approved: 'bg-approved-50 text-approved-600',
  Rejected: 'bg-rejected-50 text-rejected-600',
  Cancelled: 'bg-cancelled-50 text-cancelled-600',
};

export default function StatusPill({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${STYLES[status] || STYLES.Cancelled}`}>
      {status}
    </span>
  );
}
