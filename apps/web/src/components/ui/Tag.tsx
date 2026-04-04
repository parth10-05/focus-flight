interface TagProps {
  label: string;
  variant: "green" | "blue" | "amber" | "muted";
}

const variantClasses: Record<TagProps["variant"], string> = {
  green: "bg-accent-green/20 text-accent-green",
  blue: "bg-accent-blue/20 text-accent-blue",
  amber: "bg-accent-amber/20 text-accent-amber",
  muted: "bg-text-muted/20 text-muted"
};

export default function Tag({ label, variant }: TagProps): JSX.Element {
  return (
    <span
      className={[
        "inline-flex items-center rounded-small px-2 py-1 font-mono text-xs uppercase tracking-[0.08em]",
        variantClasses[variant]
      ].join(" ")}
    >
      {label}
    </span>
  );
}
