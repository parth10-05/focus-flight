interface FooterMetricProps {
  label: string;
  value: string;
  withPulse?: boolean;
}

export default function FooterMetric({ label, value, withPulse = false }: FooterMetricProps): JSX.Element {
  return (
    <div className="space-y-1">
      <div className="text-[9px] font-label text-secondary tracking-widest uppercase">{label}</div>
      {withPulse ? (
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
          <span className="font-mono text-[10px] uppercase">{value}</span>
        </div>
      ) : (
        <div className="font-mono text-[10px]">{value}</div>
      )}
    </div>
  );
}
