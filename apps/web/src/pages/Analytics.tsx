import { useEffect, useMemo, useState } from "react";

import MonoStatRow from "@/components/shared/MonoStatRow";
import { supabase } from "@/lib/supabase";

const WEEKDAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;

type SessionMetric = {
  id: string;
  actual_duration: number | null;
  distractions_blocked_count: number | null;
  flights: {
    start_time: string | null;
  } | null;
};

type BlockedSite = {
  domain: string;
};

export default function Analytics(): JSX.Element {
  const [sessions, setSessions] = useState<SessionMetric[]>([]);
  const [domains, setDomains] = useState<BlockedSite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

      setSessions((sessionData as SessionMetric[]) ?? []);
      setDomains((domainData as BlockedSite[]) ?? []);
      setIsLoading(false);
    };

    void load();
  }, []);

  const formatMinutesAsHm = (minutes: number): string => {
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

    const domainCount = new Map<string, number>();
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

  return (
    <div className="text-on-surface font-body overflow-x-hidden">
      <main className="px-8 py-10 pb-12 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-12">
          <section className="flex flex-col space-y-2">
            <h1 className="text-5xl font-light tracking-[0.1em] text-primary">Flight Mode Analysis</h1>
            <p className="text-secondary label-font text-sm uppercase tracking-widest">Informational summary from your completed sessions</p>
          </section>

          {errorMessage ? <p className="text-error font-mono text-xs">{errorMessage}</p> : null}

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-8 bg-surface-container-low p-8 border-l border-white/5 relative overflow-hidden">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <h2 className="text-xl font-light tracking-wide text-on-surface">Focus Altitude Map</h2>
                  <p className="text-xs text-secondary label-font mt-1">Total focus minutes by weekday (based on session start date)</p>
                </div>
                <div className="technical-font text-[10px] text-primary-dim bg-white/5 px-3 py-1">
                  WEEKLY TOTAL: {formatMinutesAsHm(totals.weeklyFocusMinutes.reduce((sum, minutes) => sum + minutes, 0))}
                </div>
              </div>
              <div className="h-64 flex items-end justify-between space-x-2 relative">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
                  <div className="border-t border-white w-full"></div>
                  <div className="border-t border-white w-full"></div>
                  <div className="border-t border-white w-full"></div>
                  <div className="border-t border-white w-full"></div>
                </div>
                {WEEKDAY_LABELS.map((label, index) => {
                  const dayMinutes = totals.weeklyFocusMinutes[index] ?? 0;
                  const dayHeight = Math.max(8, Math.round((dayMinutes / totals.peakFocusMinutes) * 100));
                  const isPeak = dayMinutes > 0 && label === totals.topDay;

                  return (
                    <div key={label} className="flex-1 flex flex-col justify-end items-center">
                      <div
                        className={`w-full ${isPeak ? "bg-primary text-on-primary border-t-2 border-primary ring-1 ring-primary/20" : "bg-primary/20 border-t border-primary/60"}`}
                        style={{ height: `${dayHeight}%` }}
                      ></div>
                      <span className={`technical-font text-[10px] mt-2 ${isPeak ? "text-primary" : "text-slate-500"}`}>{label}</span>
                      <span className="technical-font text-[9px] text-secondary/70">{formatMinutesAsHm(dayMinutes)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 bg-surface-container p-8 flex flex-col justify-between border-t border-white/5">
              <div>
                <h2 className="text-sm font-light tracking-widest text-secondary label-font uppercase">Signal Consistency</h2>
                <div className="mt-8 flex items-baseline space-x-2">
                  <span className="technical-font text-6xl font-light text-primary tracking-tighter">{formatMinutesAsHm(totals.totalFocusMinutes)}</span>
                  <span className="technical-font text-sm text-secondary">HH:MM</span>
                </div>
                <div className="mt-4 flex items-center space-x-2 text-primary-dim">
                  <span className="material-symbols-outlined text-sm">arrow_upward</span>
                  <span className="technical-font text-[10px]">TOTAL FOCUS TIME</span>
                </div>
                <p className="mt-5 text-[11px] text-secondary leading-relaxed">
                  {isLoading
                    ? "Loading analytics feed..."
                    : totals.totalSessions > 0
                    ? `Your strongest focus day is ${totals.topDay}. Average session length is ${formatMinutesAsHm(totals.avgSessionMinutes)}.`
                    : "No completed sessions yet. Start a flight to generate analytics."}
                </p>
              </div>
              <div className="space-y-4 mt-12">
                <MonoStatRow label="Total Sessions" value={String(totals.totalSessions || 0)} />
                <MonoStatRow label="Average Session" value={formatMinutesAsHm(totals.avgSessionMinutes)} />
                <MonoStatRow label="Longest Session" value={formatMinutesAsHm(totals.longestSessionMinutes)} />
                <MonoStatRow label="Distractions Blocked" value={String(totals.totalDistractions || 0)} />
                <MonoStatRow label="Distractions / Hour" value={String(totals.distractionRatePerHour)} />
                <MonoStatRow label="Most Blocked Domain" value={totals.mostBlocked || "—"} />
                <MonoStatRow label="Top Focus Day" value={totals.topDay} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
