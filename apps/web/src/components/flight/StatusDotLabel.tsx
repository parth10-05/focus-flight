interface StatusDotLabelProps {
  label: string;
  pulsing?: boolean;
}

export default function StatusDotLabel({ label, pulsing = false }: StatusDotLabelProps): JSX.Element {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full bg-primary/20 ${pulsing ? "animate-pulse" : ""}`}></span>
      <span className="font-mono text-[10px] tracking-widest text-secondary uppercase">{label}</span>
    </div>
  );
}
