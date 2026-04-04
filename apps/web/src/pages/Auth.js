import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendToExtension } from "@/lib/extensionBridge";
import { supabase } from "@/lib/supabase";
export default function Auth() {
    const navigate = useNavigate();
    const [mode, setMode] = useState("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState(null);
    const [noticeMessage, setNoticeMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const resolvePostAuthRoute = async (userId) => {
        const { data, error } = await supabase
            .from("flights")
            .select("id")
            .eq("user_id", userId)
            .eq("status", "active")
            .order("start_time", { ascending: false })
            .limit(1)
            .maybeSingle();
        if (error) {
            console.error("Failed to resolve active flight for redirect", error.message);
            return "/preflight";
        }
        if (data?.id) {
            return `/flight/${data.id}`;
        }
        return "/preflight";
    };
    useEffect(() => {
        const redirectIfAuthenticated = async () => {
            const { data } = await supabase.auth.getSession();
            if (!data.session?.user?.id) {
                return;
            }
            const redirectPath = await resolvePostAuthRoute(data.session.user.id);
            navigate(redirectPath, { replace: true });
        };
        void redirectIfAuthenticated();
    }, [navigate]);
    const sendSessionToExtension = (session) => {
        if (!session) {
            return;
        }
        console.log("[AeroFocus Web] Login success, sending session to extension:", session.user.id);
        sendToExtension({
            type: "SET_SESSION",
            payload: {
                access_token: session.access_token,
                refresh_token: session.refresh_token,
                user_id: session.user.id
            }
        });
    };
    const clearSessionInExtension = () => {
        sendToExtension({ type: "CLEAR_SESSION" });
    };
    const handleLogin = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setErrorMessage(null);
        setNoticeMessage(null);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            if (error) {
                throw new Error(error.message);
            }
            sendSessionToExtension(data.session);
            const redirectPath = await resolvePostAuthRoute(data.session.user.id);
            navigate(redirectPath, { replace: true });
        }
        catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Login failed");
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleSignup = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setErrorMessage(null);
        setNoticeMessage(null);
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password
            });
            if (error) {
                throw new Error(error.message);
            }
            sendSessionToExtension(data.session);
            if (data.session?.user?.id) {
                const redirectPath = await resolvePostAuthRoute(data.session.user.id);
                navigate(redirectPath, { replace: true });
                return;
            }
            setNoticeMessage("Signup request submitted. Check your email if confirmation is enabled.");
        }
        catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Signup failed");
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleLogout = async () => {
        setIsLoading(true);
        setErrorMessage(null);
        setNoticeMessage(null);
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                throw new Error(error.message);
            }
            clearSessionInExtension();
            setNoticeMessage("Logged out successfully.");
        }
        catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Logout failed");
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsxs("main", { className: "min-h-screen overflow-hidden relative bg-[#0d0e0f] text-[#c1c7ce]", children: [_jsx("div", { className: "absolute inset-0 pointer-events-none", children: _jsx("div", { className: "absolute -top-28 right-[8%] h-72 w-72 rounded-full bg-[#c1c7ce]/[0.04] blur-[40px]" }) }), _jsxs("header", { className: "relative z-10 flex items-center justify-between px-8 py-4 bg-[#1d2022]/70 backdrop-blur-[16px]", children: [_jsx("div", { className: "text-xl font-light tracking-[0.2em] text-[#c1c7ce]", children: "AeroFocus" }), _jsx("div", { className: "font-mono text-[10px] tracking-[0.3em] uppercase text-[#939eb4]", children: "AUTH CHANNEL" })] }), _jsxs("section", { className: "relative z-10 mx-auto w-full max-w-6xl pl-10 pr-6 pt-16 pb-20", children: [_jsxs("div", { className: "mb-16 pl-8 pr-4", children: [_jsx("h1", { className: "font-sans font-light text-5xl tracking-[0.1em] uppercase leading-[1.15] text-[#c1c7ce]", children: "Mission Authentication" }), _jsx("p", { className: "mt-6 max-w-xl text-[#939eb4] text-sm leading-[1.6] tracking-[0.04em]", children: "Authenticate flight control before initiating a deep-work trajectory." })] }), _jsxs("div", { className: "max-w-3xl bg-[#1d2022]/70 backdrop-blur-[16px] rounded-small pl-8 pr-4 py-10", children: [_jsxs("div", { className: "mb-6 inline-flex rounded-small border border-[#45484b]/30 overflow-hidden", children: [_jsx("button", { type: "button", className: `px-5 py-2 font-mono text-[10px] tracking-[0.2em] uppercase transition-all duration-150 ${mode === "login" ? "bg-[#c1c7ce] text-[#3b4147]" : "text-[#c1c7ce] hover:bg-[#c1c7ce]/[0.02]"}`, onClick: () => setMode("login"), children: "Login" }), _jsx("button", { type: "button", className: `px-5 py-2 font-mono text-[10px] tracking-[0.2em] uppercase transition-all duration-150 ${mode === "signup" ? "bg-[#c1c7ce] text-[#3b4147]" : "text-[#c1c7ce] hover:bg-[#c1c7ce]/[0.02]"}`, onClick: () => setMode("signup"), children: "Sign Up" })] }), _jsxs("div", { className: "mb-8 grid gap-2", children: [_jsx("span", { className: "font-mono text-[10px] tracking-[0.28em] uppercase text-[#939eb4]", children: "Access Channel" }), _jsx("span", { className: "font-mono text-xs text-[#a9abaf]", children: "SECURE_AUTH_PIPELINE_01" })] }), _jsxs("form", { className: "grid gap-8", onSubmit: mode === "login" ? handleLogin : handleSignup, children: [_jsxs("div", { className: "grid gap-2", children: [_jsx("label", { className: "text-[#939eb4] text-[11px] tracking-[0.16em] uppercase", htmlFor: "email", style: { fontFamily: "'Space Grotesk', var(--font-sans)" }, children: "Email Vector" }), _jsx("input", { id: "email", type: "email", value: email, onChange: (event) => setEmail(event.target.value), required: true, className: "w-full bg-transparent border-0 border-b-2 border-[#45484b] text-[#e3e5e9] py-3 font-mono tracking-[0.04em] text-sm outline-none transition-all duration-150 ease-linear focus:border-[#c1c7ce] focus:shadow-[0_2px_0_0_rgba(65,72,77,1)]", placeholder: "pilot@aerofocus.io", autoComplete: "email" })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx("label", { className: "text-[#939eb4] text-[11px] tracking-[0.16em] uppercase", htmlFor: "password", style: { fontFamily: "'Space Grotesk', var(--font-sans)" }, children: "Passphrase" }), _jsx("input", { id: "password", type: "password", value: password, onChange: (event) => setPassword(event.target.value), required: true, className: "w-full bg-transparent border-0 border-b-2 border-[#45484b] text-[#e3e5e9] py-3 font-mono tracking-[0.04em] text-sm outline-none transition-all duration-150 ease-linear focus:border-[#c1c7ce] focus:shadow-[0_2px_0_0_rgba(65,72,77,1)]", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", autoComplete: "current-password" })] }), _jsxs("div", { className: "flex flex-wrap gap-3 pt-2", children: [_jsx("button", { type: "submit", disabled: isLoading, className: "px-6 py-3 rounded-small bg-[#c1c7ce] text-[#3b4147] font-mono text-[11px] tracking-[0.2em] uppercase transition-all duration-150 ease-linear disabled:opacity-60 disabled:cursor-not-allowed", children: isLoading ? "Authenticating" : mode === "login" ? "Login" : "Create Account" }), _jsx("button", { type: "button", onClick: () => void handleLogout(), disabled: isLoading, className: "px-6 py-3 rounded-small border border-[#45484b]/20 text-[#c1c7ce] font-mono text-[11px] tracking-[0.2em] uppercase transition-all duration-150 ease-linear hover:bg-[#c1c7ce]/[0.02] disabled:opacity-60 disabled:cursor-not-allowed", children: "Logout" })] })] }), errorMessage ? (_jsx("p", { className: "mt-6 font-mono text-xs tracking-[0.04em] text-[#ee7d77]", children: errorMessage })) : null, noticeMessage ? (_jsx("p", { className: "mt-6 font-mono text-xs tracking-[0.04em] text-[#939eb4]", children: noticeMessage })) : null] })] })] }));
}
