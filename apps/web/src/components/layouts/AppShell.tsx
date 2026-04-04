import type { ReactNode } from "react";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps): JSX.Element {
  return (
    <div className="min-h-screen bg-base text-primary">
      <nav className="flex items-center justify-between px-6 py-4 bg-surface rounded-standard">
        <div className="font-mono uppercase tracking-[0.08em]">AeroFocus</div>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-elevated" aria-hidden="true" />
          <button type="button" className="font-mono text-sm text-secondary uppercase tracking-[0.08em]">
            Logout
          </button>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
