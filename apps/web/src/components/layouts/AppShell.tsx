import type { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { sendToExtension } from "@/lib/extensionBridge";
import { supabase } from "@/lib/supabase";
import { useFlightStore } from "@/store/useFlightStore";

interface AppShellProps {
  children: ReactNode;
  hideNav?: boolean;
}

export function AppShell({ children, hideNav = false }: AppShellProps): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    sendToExtension({ type: "CLEAR_SESSION" });
    useFlightStore.getState().reset();
    navigate("/auth");
  };

  const navLinks = [
    { label: "HANGAR", to: "/preflight" },
    { label: "LOGBOOK", to: "/logbook" },
    { label: "ANALYTICS", to: "/analytics" }
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-base)", color: "var(--color-text-primary)" }}>
      {!hideNav ? (
        <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0d0e0f]/70 backdrop-blur-lg">
          <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between px-8">
          <Link
            to="/preflight"
            className="text-[#c1c7ce] text-sm font-semibold tracking-[0.18em] no-underline"
          >
            AEROFOCUS
          </Link>

          <nav className="hidden h-full items-center gap-8 md:flex">
            {navLinks.map((link) => {
              const active = location.pathname.startsWith(link.to);

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`font-light tracking-[0.1em] text-sm uppercase no-underline pb-1 border-b-2 transition-colors duration-150 ${
                    active ? "text-[#c1c7ce] border-[#c1c7ce]" : "text-[#939eb4] border-transparent hover:text-[#e4ebff]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-5">
            <button
              type="button"
              className="material-symbols-outlined text-[#c1c7ce] text-[20px] hover:text-[#e4ebff] transition-colors"
              aria-label="Open profile"
              onClick={() => navigate("/profile")}
            >
              account_circle
            </button>
            <button
              onClick={() => void handleLogout()}
              className="border border-[#c1c7ce]/20 px-4 py-1.5 text-[11px] text-[#939eb4] tracking-[0.12em] uppercase hover:text-[#c1c7ce] hover:border-[#c1c7ce]/40 transition-colors"
            >
              LOGOUT
            </button>
          </div>
          </div>
        </header>
      ) : null}

      <main style={{ width: "100%" }}>{children}</main>
    </div>
  );
}

export default AppShell;
