import type { ReactNode } from "react";

interface PanelProps {
  elevated?: boolean;
  children: ReactNode;
}

export default function Panel({ elevated = false, children }: PanelProps): JSX.Element {
  return (
    <section className={["rounded-standard", elevated ? "bg-elevated" : "bg-surface"].join(" ")}>
      {children}
    </section>
  );
}
