interface MonoStatRowProps {
  label: string;
  value: string;
}

export default function MonoStatRow({ label, value }: MonoStatRowProps): JSX.Element {
  return (
    <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-b-0">
      <span className="label-font text-[10px] uppercase text-secondary">{label}</span>
      <span className="technical-font text-[10px]">{value}</span>
    </div>
  );
}
