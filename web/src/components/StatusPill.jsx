const STATUS_LABELS = {
  published: 'منتشرشده',
  in_development: 'در حال ساخت',
  concept: 'در مرحله ایده',
};

export default function StatusPill({ status, label }) {
  return (
    <span className={`status status-${status}`}>
      <span className="status-dot" aria-hidden="true" />
      {label ?? STATUS_LABELS[status] ?? 'در حال بررسی'}
    </span>
  );
}
