import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "@/components/shared/StatusBadge";
import { supabase } from "@/lib/supabase";
function formatDate(value) {
    if (!value) {
        return "—";
    }
    const d = new Date(value);
    const date = d.toISOString().slice(0, 10).replace(/-/g, ".");
    const time = d.toTimeString().slice(0, 5);
    return `${date} | ${time}`;
}
function formatDuration(value) {
    if (!value || value <= 0) {
        return "00.0 HRS";
    }
    const seconds = value > 5000 ? value : value * 60;
    const hours = seconds / 3600;
    return `${hours.toFixed(1).padStart(4, "0")} HRS`;
}
export default function Logbook() {
    const navigate = useNavigate();
    const [rows, setRows] = useState([]);
    const [page, setPage] = useState(0);
    const [count, setCount] = useState(0);
    useEffect(() => {
        const offset = page * 10;
        const load = async () => {
            const { data, error, count: total } = await supabase
                .from("sessions_log")
                .select("id, actual_duration, flights:flight_id (id, origin, destination, start_time, status)", { count: "exact" })
                .order("start_time", { foreignTable: "flights", ascending: false })
                .range(offset, offset + 9);
            if (error) {
                console.error("Failed to load logbook", error.message);
                setRows([]);
                setCount(0);
                return;
            }
            const normalizedRows = (data ?? []).map((item) => {
                const raw = item;
                const flight = Array.isArray(raw.flights) ? raw.flights[0] ?? null : raw.flights;
                return {
                    id: raw.id,
                    actual_duration: raw.actual_duration,
                    flights: flight
                };
            });
            setRows(normalizedRows);
            setCount(total ?? 0);
        };
        void load();
    }, [page]);
    const canPrev = page > 0;
    const canNext = useMemo(() => (page + 1) * 10 < count, [count, page]);
    return (_jsxs("div", { className: "bg-background text-on-background selection:bg-primary selection:text-on-primary min-h-screen", children: [_jsxs("nav", { className: "fixed top-0 w-full z-50 bg-[#0d0e0f] dark:bg-[#0d0e0f] opacity-70 backdrop-blur-lg border-b border-[#c1c7ce]/10 flex justify-between items-center px-8 h-16", children: [_jsx("button", { className: "text-xl font-light tracking-[0.2em] text-[#c1c7ce] bg-transparent border-0 p-0", onClick: () => navigate("/logbook"), type: "button", children: "Flight Mode" }), _jsxs("div", { className: "hidden md:flex gap-8 items-center h-full", children: [_jsx("button", { className: "text-[#939eb4] font-light tracking-[0.1em] text-sm font-sans hover:text-[#e4ebff] transition-colors duration-150 bg-transparent border-0 p-0", onClick: () => navigate("/preflight"), type: "button", children: "Hangar" }), _jsx("span", { className: "text-[#c1c7ce] border-b-2 border-[#c1c7ce] pb-1 font-light tracking-[0.1em] text-sm font-sans", children: "Logbook" }), _jsx("button", { className: "text-[#939eb4] font-light tracking-[0.1em] text-sm font-sans hover:text-[#e4ebff] transition-colors duration-150 bg-transparent border-0 p-0", onClick: () => navigate("/analytics"), type: "button", children: "Analytics" })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("span", { className: "material-symbols-outlined text-[#c1c7ce] cursor-pointer hover:text-[#e4ebff] transition-all", children: "settings" }), _jsx("span", { className: "material-symbols-outlined text-[#c1c7ce] cursor-pointer hover:text-[#e4ebff] transition-all", children: "account_circle" })] })] }), _jsxs("aside", { className: "fixed left-0 top-16 h-full w-64 border-r border-[#c1c7ce]/10 bg-[#0d0e0f] dark:bg-[#0d0e0f] opacity-70 backdrop-blur-xl flex flex-col py-6 px-4 hidden lg:flex", children: [_jsxs("div", { className: "mb-10 px-2", children: [_jsx("div", { className: "font-mono text-[11px] tracking-widest text-secondary uppercase opacity-50", children: "Command Center" }), _jsx("div", { className: "text-primary font-headline font-light tracking-[0.1em] text-lg", children: "STRATOS" }), _jsx("div", { className: "font-mono text-[10px] text-secondary", children: "Vanguard 01" })] }), _jsxs("div", { className: "flex-1 space-y-1", children: [_jsxs("button", { className: "w-full text-left flex items-center gap-3 px-3 py-2 text-[#939eb4] hover:bg-[#c1c7ce]/5 transition-all duration-150 font-mono text-[11px] tracking-tight bg-transparent border-0", onClick: () => navigate("/preflight"), type: "button", children: [_jsx("span", { className: "material-symbols-outlined text-sm", children: "flight_takeoff" }), "Pre-Flight"] }), _jsxs("span", { className: "flex items-center gap-3 px-3 py-2 bg-[#c1c7ce]/10 text-[#c1c7ce] border-l-2 border-[#c1c7ce] font-mono text-[11px] tracking-tight", children: [_jsx("span", { className: "material-symbols-outlined text-sm", children: "radar" }), "Active Duty"] }), _jsxs("button", { className: "w-full text-left flex items-center gap-3 px-3 py-2 text-[#939eb4] hover:bg-[#c1c7ce]/5 transition-all duration-150 font-mono text-[11px] tracking-tight bg-transparent border-0", onClick: () => navigate("/analytics"), type: "button", children: [_jsx("span", { className: "material-symbols-outlined text-sm", children: "flight_land" }), "Post-Flight"] })] })] }), _jsxs("main", { className: "lg:ml-64 pt-24 px-8 pb-12 min-h-screen", children: [_jsx("header", { className: "mb-12", children: _jsxs("div", { className: "flex flex-col md:flex-row md:items-end justify-between gap-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-4xl md:text-6xl font-headline font-light tracking-[0.15em] text-primary mb-2", children: "FLIGHT LOGBOOK" }), _jsx("p", { className: "font-label text-secondary text-sm tracking-widest uppercase", children: "Archival mission data // Sequence 882-Alpha" })] }), _jsxs("div", { className: "bg-surface-container-high p-4 border-l border-primary/30 flex items-center gap-4", children: [_jsx("span", { className: "material-symbols-outlined text-primary", children: "warning" }), _jsxs("div", { className: "font-mono text-[11px] leading-tight", children: [_jsx("span", { className: "block text-secondary", children: "SYSTEM STATUS" }), _jsx("span", { className: "block text-primary", children: "ALL SYSTEMS NOMINAL" })] })] })] }) }), _jsxs("section", { className: "bg-surface-container-low border border-outline-variant/10", children: [_jsxs("div", { className: "p-6 border-b border-outline-variant/10 flex justify-between items-center", children: [_jsx("h2", { className: "font-label text-xs tracking-[0.2em] text-primary uppercase", children: "Recent Deployments" }), _jsxs("div", { className: "flex gap-4", children: [_jsx("button", { className: "font-mono text-[10px] text-secondary", disabled: !canPrev, onClick: () => setPage((p) => Math.max(0, p - 1)), children: "PREV" }), _jsx("button", { className: "font-mono text-[10px] text-secondary", disabled: !canNext, onClick: () => setPage((p) => p + 1), children: "NEXT" })] })] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left", children: [_jsx("thead", { children: _jsxs("tr", { className: "font-mono text-[10px] text-secondary tracking-widest border-b border-outline-variant/10", children: [_jsx("th", { className: "px-6 py-4 font-normal", children: "DATE / TIME" }), _jsx("th", { className: "px-6 py-4 font-normal", children: "ROUTE" }), _jsx("th", { className: "px-6 py-4 font-normal", children: "DURATION" }), _jsx("th", { className: "px-6 py-4 font-normal", children: "STATUS" }), _jsx("th", { className: "px-6 py-4 font-normal text-right", children: "TELEMETRY" })] }) }), _jsx("tbody", { className: "font-mono text-xs", children: rows.map((row) => (_jsxs("tr", { className: "hover:bg-primary/5 transition-colors group cursor-pointer", onClick: () => row.flights?.id && navigate(`/debrief/${row.flights.id}`), children: [_jsx("td", { className: "px-6 py-5 text-secondary", children: formatDate(row.flights?.start_time ?? null) }), _jsxs("td", { className: "px-6 py-5 text-primary", children: [row.flights?.origin ?? "Unknown", " ", _jsx("span", { className: "material-symbols-outlined text-[10px] mx-1", children: "arrow_forward" }), " ", row.flights?.destination ?? "Unknown"] }), _jsx("td", { className: "px-6 py-5", children: formatDuration(row.actual_duration) }), _jsx("td", { className: "px-6 py-5", children: _jsx(StatusBadge, { status: row.flights?.status ?? "unknown" }) }), _jsx("td", { className: "px-6 py-5 text-right", children: _jsx("span", { className: "material-symbols-outlined text-sm text-secondary group-hover:text-primary transition-all", children: "monitoring" }) })] }, row.id))) })] }) }), _jsx("div", { className: "p-6 bg-surface-container-lowest flex justify-center border-t border-outline-variant/10", children: _jsx("button", { className: "font-label text-[10px] tracking-[0.3em] text-primary hover:text-tertiary transition-all uppercase disabled:opacity-50", disabled: !canNext, onClick: () => setPage((p) => p + 1), type: "button", children: "Load Historical Archives" }) })] })] })] }));
}
