import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import ActiveFlight from "@/pages/ActiveFlight";
import Analytics from "@/pages/Analytics";
import Auth from "@/pages/Auth";
import Debrief from "@/pages/Debrief";
import Logbook from "@/pages/Logbook";
import PreFlight from "@/pages/PreFlight";
import { supabase } from "@/lib/supabase";
function useSessionState() {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    useEffect(() => {
        let mounted = true;
        const initialize = async () => {
            const { data } = await supabase.auth.getSession();
            if (!mounted) {
                return;
            }
            setIsAuthenticated(Boolean(data.session));
            setIsLoading(false);
        };
        void initialize();
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!mounted) {
                return;
            }
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
function RootRedirect() {
    const { isLoading, isAuthenticated } = useSessionState();
    if (isLoading) {
        return _jsx("div", { className: "min-h-screen bg-[#0d0e0f]" });
    }
    return _jsx(Navigate, { to: isAuthenticated ? "/preflight" : "/auth", replace: true });
}
export default function App() {
    return (_jsx(BrowserRouter, { future: {
            v7_startTransition: true,
            v7_relativeSplatPath: true
        }, children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(RootRedirect, {}) }), _jsx(Route, { path: "/auth", element: _jsx(Auth, {}) }), _jsx(Route, { path: "/preflight", element: (_jsx(RequireAuth, { children: _jsx(PreFlight, {}) })) }), _jsx(Route, { path: "/flight/:id", element: (_jsx(RequireAuth, { children: _jsx(ActiveFlight, {}) })) }), _jsx(Route, { path: "/debrief/:id", element: (_jsx(RequireAuth, { children: _jsx(Debrief, {}) })) }), _jsx(Route, { path: "/logbook", element: (_jsx(RequireAuth, { children: _jsx(Logbook, {}) })) }), _jsx(Route, { path: "/analytics", element: (_jsx(RequireAuth, { children: _jsx(Analytics, {}) })) }), _jsx(Route, { path: "*", element: _jsx(RootRedirect, {}) })] }) }));
}
