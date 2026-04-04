interface FooterTelemetryItemProps {
  icon: string;
  label: string;
  active?: boolean;
}

export default function FooterTelemetryItem({ icon, label, active = false }: FooterTelemetryItemProps): JSX.Element {
  return (
    <div className="flex items-center gap-1">
      <span className={`material-symbols-outlined text-[14px] ${active ? "text-primary" : "text-secondary-dim"}`}>{icon}</span>
      <span className={`font-mono text-[10px] tracking-widest uppercase ${active ? "text-primary" : "text-secondary-dim"}`}>{label}</span>
    </div>
  );
}
