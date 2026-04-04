import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useNavigate } from "react-router-dom";
import { sendToExtension } from "@/lib/extensionBridge";
import { supabase } from "@/lib/supabase";
import { useFlightStore } from "@/store/useFlightStore";
export default function AppShell({ children }) {
    const navigate = useNavigate();
    const handleLogout = async () => {
        await supabase.auth.signOut();
        sendToExtension({ type: "CLEAR_SESSION" });
        useFlightStore.getState().reset();
        navigate("/auth");
    };
    return (_jsxs("div", { className: "min-h-screen bg-base text-primary", children: [_jsxs("nav", { className: "flex items-center justify-between px-6 py-4 bg-surface rounded-standard", children: [_jsxs("div", { className: "flex items-center gap-6", children: [_jsx(Link, { to: "/logbook", className: "font-mono uppercase tracking-[0.08em]", children: "AeroFocus" }), _jsx(Link, { to: "/logbook", className: "font-mono text-sm text-secondary uppercase tracking-[0.08em]", children: "Logbook" }), _jsx(Link, { to: "/analytics", className: "font-mono text-sm text-secondary uppercase tracking-[0.08em]", children: "Analytics" })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "h-8 w-8 rounded-full bg-elevated", "aria-hidden": "true" }), _jsx("button", { type: "button", className: "font-mono text-sm text-secondary uppercase tracking-[0.08em]", onClick: () => void handleLogout(), children: "Logout" })] })] }), _jsx("main", { children: children })] }));
}
