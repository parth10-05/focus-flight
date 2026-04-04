interface OverlayMetricProps {
  label: string;
  value: string;
}

export default function OverlayMetric({ label, value }: OverlayMetricProps): JSX.Element {
  return (
    <div className="text-right">
      <p className="font-label text-[9px] tracking-[0.2em] text-secondary uppercase mb-1">{label}</p>
      <p className="font-mono text-xl text-primary leading-none">{value}</p>
    </div>
  );
}
