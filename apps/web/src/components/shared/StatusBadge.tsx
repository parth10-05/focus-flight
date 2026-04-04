interface StatusBadgeProps {
  status: string;
}

function toVariant(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized === "completed" || normalized === "complete") {
    return "bg-secondary-container text-on-secondary-container";
  }
  if (normalized === "aborted") {
    return "bg-error-container text-on-error-container";
  }
  return "bg-primary-container text-on-primary-container";
}

export default function StatusBadge({ status }: StatusBadgeProps): JSX.Element {
  return (
    <span className={`inline-block px-2 py-0.5 text-[9px] tracking-tighter uppercase ${toVariant(status)}`}>
      {status}
    </span>
  );
}
