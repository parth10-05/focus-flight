import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import MonoStatRow from "@/components/shared/MonoStatRow";
import { supabase } from "@/lib/supabase";
const WEEKDAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
export default function Analytics() {
    const [sessions, setSessions] = useState([]);
    const [domains, setDomains] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);
    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            setErrorMessage(null);
            const [{ data: sessionData, error: sessionError }, { data: domainData, error: domainError }] = await Promise.all([
                supabase.from("sessions_log").select("id, actual_duration, distractions_blocked_count, flights:flight_id(start_time)"),
                supabase.from("blocked_sites").select("domain")
            ]);
            if (sessionError || domainError) {
                setErrorMessage(sessionError?.message ?? domainError?.message ?? "Failed to load analytics");
                setSessions([]);
                setDomains([]);
                setIsLoading(false);
                return;
            }
            const normalizedSessions = (sessionData ?? []).map((row) => {
                const normalizedFlight = Array.isArray(row.flights) ? row.flights[0] ?? null : row.flights;
                return {
                    id: row.id,
                    actual_duration: row.actual_duration,
                    distractions_blocked_count: row.distractions_blocked_count,
                    flights: normalizedFlight
                };
            });
            setSessions(normalizedSessions);
            setDomains(domainData ?? []);
            setIsLoading(false);
        };
        void load();
    }, []);
    const formatMinutesAsHm = (minutes) => {
        if (minutes <= 0) {
            return "00:00";
        }
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    };
    const totals = useMemo(() => {
        const totalFocusMinutes = sessions.reduce((sum, row) => sum + (row.actual_duration ?? 0), 0);
        const totalSessions = sessions.length;
        const totalDistractions = sessions.reduce((sum, row) => sum + (row.distractions_blocked_count ?? 0), 0);
        const avgSessionMinutes = totalSessions > 0 ? Math.round(totalFocusMinutes / totalSessions) : 0;
        const distractionRatePerHour = totalFocusMinutes > 0
            ? Number((totalDistractions / (totalFocusMinutes / 60)).toFixed(2))
            : 0;
        const longestSessionMinutes = sessions.reduce((max, row) => Math.max(max, row.actual_duration ?? 0), 0);
        const weeklyFocusMinutes = [0, 0, 0, 0, 0, 0, 0];
        sessions.forEach((row) => {
            const startTime = row.flights?.start_time;
            if (!startTime) {
                return;
            }
            const day = new Date(startTime).getDay();
            weeklyFocusMinutes[day] += row.actual_duration ?? 0;
        });
        const peakFocusMinutes = Math.max(...weeklyFocusMinutes, 1);
        const topDayIndex = weeklyFocusMinutes.findIndex((minutes) => minutes === Math.max(...weeklyFocusMinutes));
        const topDay = topDayIndex >= 0 ? WEEKDAY_LABELS[topDayIndex] : "—";
        const domainCount = new Map();
        domains.forEach((d) => {
            domainCount.set(d.domain, (domainCount.get(d.domain) ?? 0) + 1);
        });
        const mostBlocked = [...domainCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
        return {
            totalFocusMinutes,
            totalSessions,
            totalDistractions,
            avgSessionMinutes,
            distractionRatePerHour,
            longestSessionMinutes,
            weeklyFocusMinutes,
            peakFocusMinutes,
            topDay,
            mostBlocked
        };
    }, [domains, sessions]);
    return (_jsx("div", { className: "text-on-surface font-body overflow-x-hidden", children: _jsx("main", { className: "px-8 py-10 pb-12 min-h-screen", children: _jsxs("div", { className: "max-w-7xl mx-auto space-y-12", children: [_jsxs("section", { className: "flex flex-col space-y-2", children: [_jsx("h1", { className: "text-5xl font-light tracking-[0.1em] text-primary", children: "Flight Mode Analysis" }), _jsx("p", { className: "text-secondary label-font text-sm uppercase tracking-widest", children: "Informational summary from your completed sessions" })] }), errorMessage ? _jsx("p", { className: "text-error font-mono text-xs", children: errorMessage }) : null, _jsxs("div", { className: "grid grid-cols-12 gap-6", children: [_jsxs("div", { className: "col-span-12 lg:col-span-8 bg-surface-container-low p-8 border-l border-white/5 relative overflow-hidden", children: [_jsxs("div", { className: "flex justify-between items-start mb-12", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-light tracking-wide text-on-surface", children: "Focus Altitude Map" }), _jsx("p", { className: "text-xs text-secondary label-font mt-1", children: "Total focus minutes by weekday (based on session start date)" })] }), _jsxs("div", { className: "technical-font text-[10px] text-primary-dim bg-white/5 px-3 py-1", children: ["WEEKLY TOTAL: ", formatMinutesAsHm(totals.weeklyFocusMinutes.reduce((sum, minutes) => sum + minutes, 0))] })] }), _jsxs("div", { className: "h-64 flex items-stretch justify-between space-x-2 relative", children: [_jsxs("div", { className: "absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10", children: [_jsx("div", { className: "border-t border-white w-full" }), _jsx("div", { className: "border-t border-white w-full" }), _jsx("div", { className: "border-t border-white w-full" }), _jsx("div", { className: "border-t border-white w-full" })] }), WEEKDAY_LABELS.map((label, index) => {
                                                const dayMinutes = totals.weeklyFocusMinutes[index] ?? 0;
                                                const dayHeight = Math.max(8, Math.round((dayMinutes / totals.peakFocusMinutes) * 100));
                                                const isPeak = dayMinutes > 0 && label === totals.topDay;
                                                return (_jsxs("div", { className: "flex-1 h-full flex flex-col justify-end items-center", children: [_jsx("div", { className: `w-full ${isPeak ? "bg-primary text-on-primary border-t-2 border-primary ring-1 ring-primary/20" : "bg-primary/20 border-t border-primary/60"}`, style: { height: `${dayHeight}%` } }), _jsx("span", { className: `technical-font text-[10px] mt-2 ${isPeak ? "text-primary" : "text-slate-500"}`, children: label }), _jsx("span", { className: "technical-font text-[9px] text-secondary/70", children: formatMinutesAsHm(dayMinutes) })] }, label));
                                            })] })] }), _jsxs("div", { className: "col-span-12 lg:col-span-4 bg-surface-container p-8 flex flex-col justify-between border-t border-white/5", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-sm font-light tracking-widest text-secondary label-font uppercase", children: "Signal Consistency" }), _jsxs("div", { className: "mt-8 flex items-baseline space-x-2", children: [_jsx("span", { className: "technical-font text-6xl font-light text-primary tracking-tighter", children: formatMinutesAsHm(totals.totalFocusMinutes) }), _jsx("span", { className: "technical-font text-sm text-secondary", children: "HH:MM" })] }), _jsxs("div", { className: "mt-4 flex items-center space-x-2 text-primary-dim", children: [_jsx("span", { className: "material-symbols-outlined text-sm", children: "arrow_upward" }), _jsx("span", { className: "technical-font text-[10px]", children: "TOTAL FOCUS TIME" })] }), _jsx("p", { className: "mt-5 text-[11px] text-secondary leading-relaxed", children: isLoading
                                                    ? "Loading analytics feed..."
                                                    : totals.totalSessions > 0
                                                        ? `Your strongest focus day is ${totals.topDay}. Average session length is ${formatMinutesAsHm(totals.avgSessionMinutes)}.`
                                                        : "No completed sessions yet. Start a flight to generate analytics." })] }), _jsxs("div", { className: "space-y-4 mt-12", children: [_jsx(MonoStatRow, { label: "Total Sessions", value: String(totals.totalSessions || 0) }), _jsx(MonoStatRow, { label: "Average Session", value: formatMinutesAsHm(totals.avgSessionMinutes) }), _jsx(MonoStatRow, { label: "Longest Session", value: formatMinutesAsHm(totals.longestSessionMinutes) }), _jsx(MonoStatRow, { label: "Distractions Blocked", value: String(totals.totalDistractions || 0) }), _jsx(MonoStatRow, { label: "Distractions / Hour", value: String(totals.distractionRatePerHour) }), _jsx(MonoStatRow, { label: "Most Blocked Domain", value: totals.mostBlocked || "—" }), _jsx(MonoStatRow, { label: "Top Focus Day", value: totals.topDay })] })] })] })] }) }) }));
}

