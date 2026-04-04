interface BlockedSectorChipProps {
  label: string;
  onRemove: () => void;
}

export default function BlockedSectorChip({ label, onRemove }: BlockedSectorChipProps): JSX.Element {
  return (
    <div className="px-3 py-1 bg-secondary-container/30 border border-secondary/20 flex items-center gap-4">
      <span className="font-mono text-[10px] text-secondary">{label}</span>
      <button type="button" onClick={onRemove} aria-label={`Remove ${label}`}>
        <span className="material-symbols-outlined text-[10px] text-primary cursor-pointer">close</span>
      </button>
    </div>
  );
}
