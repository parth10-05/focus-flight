import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from "react";
import MonoStatRow from "@/components/shared/MonoStatRow";
import { supabase } from "@/lib/supabase";
const WEEKDAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const TIMEFRAME_OPTIONS = ["weekday", "weekly", "monthly"];
const shortDateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const longDateFormatter = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
});
const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });
const normalizeDate = (value) => {
    const next = new Date(value);
    next.setHours(0, 0, 0, 0);
    return next;
};
const getStartOfWeek = (value) => {
    const next = normalizeDate(value);
    next.setDate(next.getDate() - next.getDay());
    return next;
};
const addDays = (value, days) => {
    const next = new Date(value);
    next.setDate(next.getDate() + days);
    return next;
};
const addMonths = (value, months) => {
    const next = new Date(value);
    next.setMonth(next.getMonth() + months);
    return next;
};
const getStartOfMonth = (value) => new Date(value.getFullYear(), value.getMonth(), 1);
const isSameDay = (left, right) => (left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate());
export default function Analytics() {
    const [sessions, setSessions] = useState([]);
    const [domains, setDomains] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);
    const [timeframe, setTimeframe] = useState("weekday");
    const [anchorDate, setAnchorDate] = useState(() => normalizeDate(new Date()));
    const [selectedMonthDay, setSelectedMonthDay] = useState(null);
    const previousTimeframeRef = useRef("weekday");
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
    const sessionsWithStartDate = useMemo(() => sessions.map((session) => {
        const startTime = session.flights?.start_time;
        if (!startTime) {
            return { ...session, startDate: null };
        }
        const parsed = new Date(startTime);
        return {
            ...session,
            startDate: Number.isNaN(parsed.getTime()) ? null : parsed
        };
    }), [sessions]);
    const today = useMemo(() => normalizeDate(new Date()), []);
    const latestSessionDate = useMemo(() => {
        const datedSessions = sessionsWithStartDate.filter((session) => session.startDate != null);
        if (datedSessions.length === 0) {
            return null;
        }
        const maxTimestamp = Math.max(...datedSessions.map((session) => session.startDate.getTime()));
        return normalizeDate(new Date(maxTimestamp));
    }, [sessionsWithStartDate]);
    const getDefaultAnchorForTimeframe = (nextTimeframe) => {
        const baseline = latestSessionDate ?? today;
        if (nextTimeframe === "weekly") {
            return getStartOfWeek(baseline);
        }
        if (nextTimeframe === "monthly") {
            return getStartOfMonth(baseline);
        }
        return today;
    };
    useEffect(() => {
        if (timeframe === "weekday") {
            previousTimeframeRef.current = timeframe;
            return;
        }
        const timeframeChanged = previousTimeframeRef.current !== timeframe;
        if (timeframeChanged) {
            setAnchorDate(getDefaultAnchorForTimeframe(timeframe));
        }
        previousTimeframeRef.current = timeframe;
    }, [latestSessionDate, timeframe, today]);
    useEffect(() => {
        if (timeframe !== "monthly") {
            setSelectedMonthDay(null);
            return;
        }
        if (!selectedMonthDay) {
            return;
        }
        const isSameMonth = selectedMonthDay.getFullYear() === anchorDate.getFullYear() &&
            selectedMonthDay.getMonth() === anchorDate.getMonth();
        if (!isSameMonth) {
            setSelectedMonthDay(null);
        }
    }, [anchorDate, selectedMonthDay, timeframe]);
    const periodSessions = useMemo(() => {
        if (timeframe === "weekday") {
            return sessionsWithStartDate;
        }
        if (timeframe === "weekly") {
            const weekStart = getStartOfWeek(anchorDate);
            const weekEnd = addDays(weekStart, 7);
            return sessionsWithStartDate.filter((session) => {
                if (!session.startDate) {
                    return false;
                }
                return session.startDate >= weekStart && session.startDate < weekEnd;
            });
        }
        const monthStart = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
        const monthEnd = new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 1);
        return sessionsWithStartDate.filter((session) => {
            if (!session.startDate) {
                return false;
            }
            return session.startDate >= monthStart && session.startDate < monthEnd;
        });
    }, [anchorDate, sessionsWithStartDate, timeframe]);
    const selectedDaySessions = useMemo(() => {
        if (timeframe !== "monthly" || !selectedMonthDay) {
            return periodSessions;
        }
        return periodSessions.filter((session) => {
            if (!session.startDate) {
                return false;
            }
            return isSameDay(session.startDate, selectedMonthDay);
        });
    }, [periodSessions, selectedMonthDay, timeframe]);
    const chartData = useMemo(() => {
        let bars = [];
        let periodLabel = "All Sessions";
        let subtitle = "All-time weekday totals (every Saturday, Sunday, etc. is summed together)";
        if (timeframe === "weekly" || timeframe === "weekday") {
            bars = WEEKDAY_LABELS.map((label, index) => ({
                key: `weekday-${label}`,
                label,
                shortLabel: label,
                minutes: 0
            }));
            periodSessions.forEach((session) => {
                if (session.startDate == null) {
                    return;
                }
                bars[session.startDate.getDay()].minutes += session.actual_duration ?? 0;
            });
            if (timeframe === "weekly") {
                const weekStart = getStartOfWeek(anchorDate);
                const weekEnd = addDays(weekStart, 6);
                periodLabel = `${shortDateFormatter.format(weekStart)} - ${shortDateFormatter.format(weekEnd)}`;
                subtitle = "Focus minutes by weekday in the selected week";
            }
        }
        else {
            const daysInMonth = new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 0).getDate();
            bars = Array.from({ length: daysInMonth }, (_, offset) => {
                const day = offset + 1;
                const shouldShowLabel = day === 1 || day === daysInMonth || day % 5 === 0;
                const dayDate = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), day);
                return {
                    key: `day-${day}`,
                    label: `Day ${day}`,
                    shortLabel: shouldShowLabel ? String(day) : "·",
                    minutes: 0,
                    date: dayDate
                };
            });
            periodSessions.forEach((session) => {
                if (session.startDate == null) {
                    return;
                }
                bars[session.startDate.getDate() - 1].minutes += session.actual_duration ?? 0;
            });
            periodLabel = monthFormatter.format(anchorDate);
            subtitle = "Focus minutes by day of month";
        }
        const peakFocusMinutes = Math.max(...bars.map((bar) => bar.minutes), 1);
        const topBar = bars.reduce((currentTop, bar) => {
            if (!currentTop || bar.minutes > currentTop.minutes) {
                return bar;
            }
            return currentTop;
        }, null);
        const topBucketValue = topBar && topBar.minutes > 0 ? topBar.label : "—";
        return {
            bars,
            subtitle,
            periodLabel,
            peakFocusMinutes,
            topBucketValue
        };
    }, [anchorDate, periodSessions, timeframe]);
    const analyticsSessions = timeframe === "monthly" && selectedMonthDay
        ? selectedDaySessions
        : periodSessions;
    const selectedMonthDayLabel = selectedMonthDay ? longDateFormatter.format(selectedMonthDay) : "—";
    const totals = useMemo(() => {
        const totalFocusMinutes = analyticsSessions.reduce((sum, row) => sum + (row.actual_duration ?? 0), 0);
        const totalSessions = analyticsSessions.length;
        const totalDistractions = analyticsSessions.reduce((sum, row) => sum + (row.distractions_blocked_count ?? 0), 0);
        const avgSessionMinutes = totalSessions > 0 ? Math.round(totalFocusMinutes / totalSessions) : 0;
        const distractionRatePerHour = totalFocusMinutes > 0
            ? Number((totalDistractions / (totalFocusMinutes / 60)).toFixed(2))
            : 0;
        const longestSessionMinutes = analyticsSessions.reduce((max, row) => Math.max(max, row.actual_duration ?? 0), 0);
        const domainCount = new Map();
        domains.forEach((d) => {
            domainCount.set(d.domain, (domainCount.get(d.domain) ?? 0) + 1);
        });
        const mostBlocked = [...domainCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
        const topFocusLabel = timeframe === "monthly" && selectedMonthDay
            ? "Selected Day"
            : timeframe === "monthly"
                ? "Top Day (Month)"
                : "Top Focus Day";
        return {
            totalFocusMinutes,
            totalSessions,
            totalDistractions,
            avgSessionMinutes,
            distractionRatePerHour,
            longestSessionMinutes,
            mostBlocked,
            topFocusLabel,
            topFocusValue: timeframe === "monthly" && selectedMonthDay
                ? selectedMonthDayLabel
                : chartData.topBucketValue
        };
    }, [analyticsSessions, chartData.topBucketValue, domains, selectedMonthDay, selectedMonthDayLabel, timeframe]);
    const canMoveNext = useMemo(() => {
        if (timeframe === "weekday") {
            return false;
        }
        if (timeframe === "weekly") {
            return getStartOfWeek(anchorDate).getTime() < getStartOfWeek(today).getTime();
        }
        return getStartOfMonth(anchorDate).getTime() < getStartOfMonth(today).getTime();
    }, [anchorDate, timeframe, today]);
    const movePeriod = (direction) => {
        if (timeframe === "weekday") {
            return;
        }
        if (direction === 1 && !canMoveNext) {
            return;
        }
        setAnchorDate((current) => {
            if (timeframe === "weekly") {
                return normalizeDate(addDays(current, direction * 7));
            }
            return normalizeDate(addMonths(current, direction));
        });
    };
    const onMonthlyBarClick = (bar) => {
        if (timeframe !== "monthly" || !bar.date) {
            return;
        }
        setSelectedMonthDay(bar.date);
    };
    const detailCopy = isLoading
        ? "Loading analytics feed..."
        : timeframe === "monthly" && selectedMonthDay && totals.totalSessions === 0
            ? "No completed sessions on the selected day."
            : totals.totalSessions > 0
                ? `Peak bucket in this view is ${totals.topFocusValue}. Average session length is ${formatMinutesAsHm(totals.avgSessionMinutes)}.`
                : "No completed sessions for this period yet.";
    return (_jsx("div", { className: "text-on-surface font-body overflow-x-hidden", children: _jsx("main", { className: "px-8 py-10 pb-12 min-h-screen", children: _jsxs("div", { className: "max-w-7xl mx-auto space-y-12", children: [_jsxs("section", { className: "flex flex-col space-y-2", children: [_jsx("h1", { className: "text-5xl font-light tracking-[0.1em] text-primary", children: "Flight Mode Analysis" }), _jsx("p", { className: "text-secondary label-font text-sm uppercase tracking-widest", children: "Informational summary from your completed sessions" })] }), _jsx("section", { className: "flex flex-wrap gap-2", children: TIMEFRAME_OPTIONS.map((option) => {
                            const isActive = option === timeframe;
                            return (_jsx("button", { type: "button", onClick: () => setTimeframe(option), className: `px-4 py-2 text-[11px] tracking-widest uppercase label-font border transition-colors ${isActive
                                    ? "bg-primary text-on-primary border-primary"
                                    : "bg-surface-container border-white/10 text-secondary hover:text-on-surface"}`, children: option }, option));
                        }) }), errorMessage ? _jsx("p", { className: "text-error font-mono text-xs", children: errorMessage }) : null, _jsxs("div", { className: "grid grid-cols-12 gap-6", children: [_jsxs("div", { className: "col-span-12 lg:col-span-8 bg-surface-container-low p-8 border-l border-white/5 relative overflow-hidden", children: [_jsxs("div", { className: "flex justify-between items-start mb-12", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-light tracking-wide text-on-surface", children: "Focus Altitude Map" }), _jsx("p", { className: "text-xs text-secondary label-font mt-1", children: chartData.subtitle })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { type: "button", disabled: timeframe === "weekday", onClick: () => movePeriod(-1), className: "technical-font text-[10px] px-2 py-1 border border-white/10 text-secondary disabled:opacity-40", children: "PREV" }), _jsx("div", { className: "technical-font text-[10px] text-primary-dim bg-white/5 px-3 py-1", children: chartData.periodLabel }), _jsx("button", { type: "button", disabled: timeframe === "weekday" || !canMoveNext, onClick: () => movePeriod(1), className: "technical-font text-[10px] px-2 py-1 border border-white/10 text-secondary disabled:opacity-40", children: "NEXT" }), _jsxs("div", { className: "technical-font text-[10px] text-primary-dim bg-white/5 px-3 py-1", children: ["PERIOD TOTAL: ", formatMinutesAsHm(totals.totalFocusMinutes)] })] })] }), timeframe === "monthly" && selectedMonthDay ? (_jsxs("div", { className: "mb-6 technical-font text-[10px] text-primary-dim bg-white/5 px-3 py-2 inline-block", children: ["DAY VIEW: ", selectedMonthDayLabel] })) : null, _jsxs("div", { className: "h-64 flex items-stretch justify-between space-x-2 relative", children: [_jsxs("div", { className: "absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10", children: [_jsx("div", { className: "border-t border-white w-full" }), _jsx("div", { className: "border-t border-white w-full" }), _jsx("div", { className: "border-t border-white w-full" }), _jsx("div", { className: "border-t border-white w-full" })] }), chartData.bars.map((bar) => {
                                                const dayHeight = Math.max(6, Math.round((bar.minutes / chartData.peakFocusMinutes) * 100));
                                                const hasData = bar.minutes > 0;
                                                const isPeak = bar.minutes > 0 && bar.label === chartData.topBucketValue;
                                                const isSelectedDay = timeframe === "monthly" && !!selectedMonthDay && !!bar.date && isSameDay(selectedMonthDay, bar.date);
                                                const barClassName = isPeak
                                                    ? "bg-primary text-on-primary border-t-2 border-primary ring-1 ring-primary/20"
                                                    : hasData
                                                        ? "bg-primary/45 border-t border-primary/80"
                                                        : "bg-primary/15 border-t border-primary/40 opacity-70";
                                                const selectedClassName = isSelectedDay ? "ring-2 ring-primary/70" : "";
                                                return (_jsxs("div", { className: "flex-1 h-full flex flex-col justify-end items-center min-w-0", role: timeframe === "monthly" ? "button" : undefined, tabIndex: timeframe === "monthly" ? 0 : -1, onClick: () => onMonthlyBarClick(bar), onKeyDown: (event) => {
                                                        if (timeframe !== "monthly") {
                                                            return;
                                                        }
                                                        if (event.key === "Enter" || event.key === " ") {
                                                            event.preventDefault();
                                                            onMonthlyBarClick(bar);
                                                        }
                                                    }, children: [_jsx("div", { className: `w-full ${barClassName} ${selectedClassName}`, style: { height: `${dayHeight}%` } }), _jsx("span", { className: `technical-font text-[10px] mt-2 ${isPeak ? "text-primary" : "text-slate-500"}`, children: bar.shortLabel }), _jsx("span", { className: "technical-font text-[9px] text-secondary/70", children: formatMinutesAsHm(bar.minutes) })] }, bar.key));
                                            })] })] }), _jsxs("div", { className: "col-span-12 lg:col-span-4 bg-surface-container p-8 flex flex-col justify-between border-t border-white/5", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-sm font-light tracking-widest text-secondary label-font uppercase", children: "Signal Consistency" }), _jsxs("div", { className: "mt-8 flex items-baseline space-x-2", children: [_jsx("span", { className: "technical-font text-6xl font-light text-primary tracking-tighter", children: formatMinutesAsHm(totals.totalFocusMinutes) }), _jsx("span", { className: "technical-font text-sm text-secondary", children: "HH:MM" })] }), _jsxs("div", { className: "mt-4 flex items-center space-x-2 text-primary-dim", children: [_jsx("span", { className: "material-symbols-outlined text-sm", children: "arrow_upward" }), _jsx("span", { className: "technical-font text-[10px]", children: "TOTAL FOCUS TIME" })] }), _jsx("p", { className: "mt-5 text-[11px] text-secondary leading-relaxed", children: detailCopy })] }), _jsxs("div", { className: "space-y-4 mt-12", children: [_jsx(MonoStatRow, { label: "Total Sessions", value: String(totals.totalSessions || 0) }), _jsx(MonoStatRow, { label: "Average Session", value: formatMinutesAsHm(totals.avgSessionMinutes) }), _jsx(MonoStatRow, { label: "Longest Session", value: formatMinutesAsHm(totals.longestSessionMinutes) }), _jsx(MonoStatRow, { label: "Distractions Blocked", value: String(totals.totalDistractions || 0) }), _jsx(MonoStatRow, { label: "Distractions / Hour", value: String(totals.distractionRatePerHour) }), _jsx(MonoStatRow, { label: "Most Blocked Domain", value: totals.mostBlocked || "—" }), _jsx(MonoStatRow, { label: totals.topFocusLabel, value: totals.topFocusValue })] })] })] })] }) }) }));
}
