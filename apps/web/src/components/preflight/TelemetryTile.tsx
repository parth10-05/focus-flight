interface TelemetryTileProps {
  label: string;
  value: string;
}

export default function TelemetryTile({ label, value }: TelemetryTileProps): JSX.Element {
  return (
    <div className="bg-surface-container-lowest p-4 border border-outline-variant/10">
      <div className="text-[9px] font-label text-secondary tracking-widest uppercase">{label}</div>
      <div className="font-mono text-sm text-on-surface">{value}</div>
    </div>
  );
}
