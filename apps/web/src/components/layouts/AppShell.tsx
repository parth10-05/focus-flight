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
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 2rem",
            height: "56px",
            background: "var(--color-surface)",
            borderBottom: "1px solid rgba(78,140,168,0.12)",
            position: "sticky",
            top: 0,
            zIndex: 50
          }}
        >
          <Link
            to="/preflight"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "14px",
              fontWeight: 600,
              letterSpacing: "0.12em",
              color: "var(--color-text-primary)",
              textDecoration: "none"
            }}
          >
            AEROFOCUS
          </Link>

          <nav style={{ display: "flex", gap: "2rem" }}>
            {navLinks.map((link) => {
              const active = location.pathname.startsWith(link.to);

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "12px",
                    letterSpacing: "0.1em",
                    textDecoration: "none",
                    color: active ? "var(--color-text-primary)" : "var(--color-text-muted)",
                    borderBottom: active ? "2px solid var(--color-accent-blue)" : "2px solid transparent",
                    paddingBottom: "4px",
                    transition: "color 0.2s"
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button
              onClick={() => void handleLogout()}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                letterSpacing: "0.08em",
                color: "var(--color-text-muted)",
                background: "none",
                border: "1px solid rgba(78,140,168,0.2)",
                borderRadius: "var(--radius-small)",
                padding: "4px 12px",
                cursor: "pointer"
              }}
            >
              LOGOUT
            </button>
          </div>
        </header>
      ) : null}

      <main style={{ width: "100%" }}>{children}</main>
    </div>
  );
}

export default AppShell;
