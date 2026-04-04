import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import MonoStatRow from "@/components/shared/MonoStatRow";
import { supabase } from "@/lib/supabase";
export default function Analytics() {
    const [sessions, setSessions] = useState([]);
    const [domains, setDomains] = useState([]);
    useEffect(() => {
        const load = async () => {
            const [{ data: sessionData }, { data: domainData }] = await Promise.all([
                supabase.from("sessions_log").select("id, actual_duration, distractions_blocked_count"),
                supabase.from("blocked_sites").select("domain")
            ]);
            setSessions(sessionData ?? []);
            setDomains(domainData ?? []);
        };
        void load();
    }, []);
    const totals = useMemo(() => {
        const totalFocusTime = sessions.reduce((sum, row) => sum + (row.actual_duration ?? 0), 0);
        const totalSessions = sessions.length;
        const totalDistractions = sessions.reduce((sum, row) => sum + (row.distractions_blocked_count ?? 0), 0);
        const domainCount = new Map();
        domains.forEach((d) => {
            domainCount.set(d.domain, (domainCount.get(d.domain) ?? 0) + 1);
        });
        const mostBlocked = [...domainCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
        return {
            totalFocusTime,
            totalSessions,
            totalDistractions,
            mostBlocked
        };
    }, [domains, sessions]);
    return (_jsx("div", { className: "text-on-surface font-body overflow-x-hidden", children: _jsx("main", { className: "px-8 py-10 pb-12 min-h-screen", children: _jsxs("div", { className: "max-w-7xl mx-auto space-y-12", children: [_jsxs("section", { className: "flex flex-col space-y-2", children: [_jsx("h1", { className: "text-5xl font-light tracking-[0.1em] text-primary", children: "Flight Mode Analysis" }), _jsx("p", { className: "text-secondary label-font text-sm uppercase tracking-widest", children: "Active Session: Decompression State Alpha" })] }), _jsxs("div", { className: "grid grid-cols-12 gap-6", children: [_jsxs("div", { className: "col-span-12 lg:col-span-8 bg-surface-container-low p-8 border-l border-white/5 relative overflow-hidden", children: [_jsxs("div", { className: "flex justify-between items-start mb-12", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-light tracking-wide text-on-surface", children: "Focus Altitude Map" }), _jsx("p", { className: "text-xs text-secondary label-font mt-1", children: "Weekly stratospheric immersion trend" })] }), _jsx("div", { className: "technical-font text-[10px] text-primary-dim bg-white/5 px-3 py-1", children: "ALTITUDE: 60,000 FT (STABLE)" })] }), _jsxs("div", { className: "h-64 flex items-end justify-between space-x-2 relative", children: [_jsxs("div", { className: "absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10", children: [_jsx("div", { className: "border-t border-white w-full" }), _jsx("div", { className: "border-t border-white w-full" }), _jsx("div", { className: "border-t border-white w-full" }), _jsx("div", { className: "border-t border-white w-full" })] }), _jsxs("div", { className: "flex-1 flex flex-col justify-end items-center", children: [_jsx("div", { className: "w-full bg-primary/20 h-[40%] border-t border-primary/60" }), _jsx("span", { className: "technical-font text-[10px] mt-4 text-slate-500", children: "MON" })] }), _jsxs("div", { className: "flex-1 flex flex-col justify-end items-center", children: [_jsx("div", { className: "w-full bg-primary/20 h-[65%] border-t border-primary/60" }), _jsx("span", { className: "technical-font text-[10px] mt-4 text-slate-500", children: "TUE" })] }), _jsxs("div", { className: "flex-1 flex flex-col justify-end items-center", children: [_jsx("div", { className: "w-full bg-primary/20 h-[50%] border-t border-primary/60" }), _jsx("span", { className: "technical-font text-[10px] mt-4 text-slate-500", children: "WED" })] }), _jsxs("div", { className: "flex-1 flex flex-col justify-end items-center", children: [_jsx("div", { className: "w-full bg-primary text-on-primary h-[92%] border-t-2 border-primary ring-1 ring-primary/20" }), _jsx("span", { className: "technical-font text-[10px] mt-4 text-primary", children: "THU" })] }), _jsxs("div", { className: "flex-1 flex flex-col justify-end items-center", children: [_jsx("div", { className: "w-full bg-primary/20 h-[78%] border-t border-primary/60" }), _jsx("span", { className: "technical-font text-[10px] mt-4 text-slate-500", children: "FRI" })] }), _jsxs("div", { className: "flex-1 flex flex-col justify-end items-center", children: [_jsx("div", { className: "w-full bg-primary/20 h-[30%] border-t border-primary/60" }), _jsx("span", { className: "technical-font text-[10px] mt-4 text-slate-500", children: "SAT" })] }), _jsxs("div", { className: "flex-1 flex flex-col justify-end items-center", children: [_jsx("div", { className: "w-full bg-primary/20 h-[25%] border-t border-primary/60" }), _jsx("span", { className: "technical-font text-[10px] mt-4 text-slate-500", children: "SUN" })] })] })] }), _jsxs("div", { className: "col-span-12 lg:col-span-4 bg-surface-container p-8 flex flex-col justify-between border-t border-white/5", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-sm font-light tracking-widest text-secondary label-font uppercase", children: "Signal Consistency" }), _jsxs("div", { className: "mt-8 flex items-baseline space-x-2", children: [_jsx("span", { className: "technical-font text-7xl font-light text-primary tracking-tighter", children: totals.totalFocusTime || 0 }), _jsx("span", { className: "technical-font text-xl text-secondary", children: "s" })] }), _jsxs("div", { className: "mt-4 flex items-center space-x-2 text-primary-dim", children: [_jsx("span", { className: "material-symbols-outlined text-sm", children: "arrow_upward" }), _jsx("span", { className: "technical-font text-[10px]", children: "AGGREGATE METRICS" })] })] }), _jsxs("div", { className: "space-y-4 mt-12", children: [_jsx(MonoStatRow, { label: "Total Sessions", value: String(totals.totalSessions || 0) }), _jsx(MonoStatRow, { label: "Distractions Blocked", value: String(totals.totalDistractions || 0) }), _jsx(MonoStatRow, { label: "Most Blocked Domain", value: totals.mostBlocked || "—" })] })] })] })] }) }) }));
}
