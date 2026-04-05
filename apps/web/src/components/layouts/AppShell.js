import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { sendToExtension } from "@/lib/extensionBridge";
import { supabase } from "@/lib/supabase";
import { useFlightStore } from "@/store/useFlightStore";
export function AppShell({ children, hideNav = false }) {
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
    return (_jsxs("div", { style: { minHeight: "100vh", background: "var(--color-base)", color: "var(--color-text-primary)" }, children: [!hideNav ? (_jsx("header", { className: "sticky top-0 z-50 border-b border-white/10 bg-[#0d0e0f]/70 backdrop-blur-lg", children: _jsxs("div", { className: "mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between px-8", children: [_jsx(Link, { to: "/preflight", className: "text-[#c1c7ce] text-sm font-semibold tracking-[0.18em] no-underline", children: "AEROFOCUS" }), _jsx("nav", { className: "hidden h-full items-center gap-8 md:flex", children: navLinks.map((link) => {
                                const active = location.pathname.startsWith(link.to);
                                return (_jsx(Link, { to: link.to, className: `font-light tracking-[0.1em] text-sm uppercase no-underline pb-1 border-b-2 transition-colors duration-150 ${active ? "text-[#c1c7ce] border-[#c1c7ce]" : "text-[#939eb4] border-transparent hover:text-[#e4ebff]"}`, children: link.label }, link.to));
                            }) }), _jsxs("div", { className: "flex items-center gap-5", children: [_jsx("button", { type: "button", className: "material-symbols-outlined text-[#c1c7ce] text-[20px] hover:text-[#e4ebff] transition-colors", "aria-label": "Open profile", onClick: () => navigate("/profile"), children: "account_circle" }), _jsx("button", { onClick: () => void handleLogout(), className: "border border-[#c1c7ce]/20 px-4 py-1.5 text-[11px] text-[#939eb4] tracking-[0.12em] uppercase hover:text-[#c1c7ce] hover:border-[#c1c7ce]/40 transition-colors", children: "LOGOUT" })] })] }) })) : null, _jsx("main", { style: { width: "100%" }, children: children })] }));
}
export default AppShell;
