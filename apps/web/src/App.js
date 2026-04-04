import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import ActiveFlight from "@/pages/ActiveFlight.tsx";
import Analytics from "@/pages/Analytics.tsx";
import Auth from "@/pages/Auth.tsx";
import { AppShell } from "@/components/layouts/AppShell.tsx";
import Debrief from "@/pages/Debrief.tsx";
import Logbook from "@/pages/Logbook.tsx";
import PreFlight from "@/pages/PreFlight.tsx";
import { sendToExtension } from "@/lib/extensionBridge";
import { supabase } from "@/lib/supabase";
function useSessionState() {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    useEffect(() => {
        let mounted = true;
        const syncSessionToExtension = (session) => {
            if (!session?.access_token || !session?.refresh_token || !session?.user?.id) {
                sendToExtension({ type: "CLEAR_SESSION" });
                return;
            }
            sendToExtension({
                type: "SET_SESSION",
                payload: {
                    access_token: session.access_token,
                    refresh_token: session.refresh_token,
                    user_id: session.user.id
                }
            });
        };
        const initialize = async () => {
            const { data } = await supabase.auth.getSession();
            if (!mounted) {
                return;
            }
            syncSessionToExtension(data.session);
            setIsAuthenticated(Boolean(data.session));
            setIsLoading(false);
        };
        void initialize();
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!mounted) {
                return;
            }
            syncSessionToExtension(session);
            setIsAuthenticated(Boolean(session));
            setIsLoading(false);
        });
        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);
    return { isLoading, isAuthenticated };
}
function RequireAuth({ children }) {
    const { isLoading, isAuthenticated } = useSessionState();
    if (isLoading) {
        return _jsx("div", { className: "min-h-screen bg-[#0d0e0f]" });
    }
    if (!isAuthenticated) {
        return _jsx(Navigate, { to: "/auth", replace: true });
    }
    return children;
}
export default function App() {
    return (_jsx(BrowserRouter, { future: {
            v7_startTransition: true,
            v7_relativeSplatPath: true
        }, children: _jsxs(Routes, { children: [_jsx(Route, { path: "/auth", element: _jsx(Auth, {}) }), _jsx(Route, { path: "/", element: (_jsx(RequireAuth, { children: _jsx(AppShell, { children: _jsx(Navigate, { to: "/preflight", replace: true }) }) })) }), _jsx(Route, { path: "/preflight", element: (_jsx(RequireAuth, { children: _jsx(AppShell, { children: _jsx(PreFlight, {}) }) })) }), _jsx(Route, { path: "/flight/:id", element: (_jsx(RequireAuth, { children: _jsx(AppShell, { hideNav: true, children: _jsx(ActiveFlight, {}) }) })) }), _jsx(Route, { path: "/debrief/:id", element: (_jsx(RequireAuth, { children: _jsx(AppShell, { children: _jsx(Debrief, {}) }) })) }), _jsx(Route, { path: "/logbook", element: (_jsx(RequireAuth, { children: _jsx(AppShell, { children: _jsx(Logbook, {}) }) })) }), _jsx(Route, { path: "/analytics", element: (_jsx(RequireAuth, { children: _jsx(AppShell, { children: _jsx(Analytics, {}) }) })) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/logbook", replace: true }) })] }) }));
}
