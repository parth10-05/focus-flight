import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";

import { sendToExtension } from "@/lib/extensionBridge";
import { supabase } from "@/lib/supabase";
import { useFlightStore } from "@/store/useFlightStore";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps): JSX.Element {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    sendToExtension({ type: "CLEAR_SESSION" });
    useFlightStore.getState().reset();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-base text-primary">
      <nav className="flex items-center justify-between px-6 py-4 bg-surface rounded-standard">
        <div className="flex items-center gap-6">
          <Link to="/logbook" className="font-mono uppercase tracking-[0.08em]">AeroFocus</Link>
          <Link to="/logbook" className="font-mono text-sm text-secondary uppercase tracking-[0.08em]">Logbook</Link>
          <Link to="/analytics" className="font-mono text-sm text-secondary uppercase tracking-[0.08em]">Analytics</Link>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-elevated" aria-hidden="true" />
          <button type="button" className="font-mono text-sm text-secondary uppercase tracking-[0.08em]" onClick={() => void handleLogout()}>
            Logout
          </button>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
