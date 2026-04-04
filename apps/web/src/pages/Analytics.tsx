import { useEffect, useMemo, useState } from "react";

import MonoStatRow from "@/components/shared/MonoStatRow";
import { supabase } from "@/lib/supabase";

type SessionMetric = {
  id: string;
  actual_duration: number | null;
  distractions_blocked_count: number | null;
};

type BlockedSite = {
  domain: string;
};

export default function Analytics(): JSX.Element {
  const [sessions, setSessions] = useState<SessionMetric[]>([]);
  const [domains, setDomains] = useState<BlockedSite[]>([]);

  useEffect(() => {
    const load = async () => {
      const [{ data: sessionData }, { data: domainData }] = await Promise.all([
        supabase.from("sessions_log").select("id, actual_duration, distractions_blocked_count"),
        supabase.from("blocked_sites").select("domain")
      ]);

      setSessions((sessionData as SessionMetric[]) ?? []);
      setDomains((domainData as BlockedSite[]) ?? []);
    };

    void load();
  }, []);

  const totals = useMemo(() => {
    const totalFocusTime = sessions.reduce((sum, row) => sum + (row.actual_duration ?? 0), 0);
    const totalSessions = sessions.length;
    const totalDistractions = sessions.reduce((sum, row) => sum + (row.distractions_blocked_count ?? 0), 0);

    const domainCount = new Map<string, number>();
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

  return (
    <div className="text-on-surface font-body overflow-x-hidden">
      <main className="px-8 py-10 pb-12 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-12">
          <section className="flex flex-col space-y-2">
            <h1 className="text-5xl font-light tracking-[0.1em] text-primary">Flight Mode Analysis</h1>
            <p className="text-secondary label-font text-sm uppercase tracking-widest">Active Session: Decompression State Alpha</p>
          </section>

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-8 bg-surface-container-low p-8 border-l border-white/5 relative overflow-hidden">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <h2 className="text-xl font-light tracking-wide text-on-surface">Focus Altitude Map</h2>
                  <p className="text-xs text-secondary label-font mt-1">Weekly stratospheric immersion trend</p>
                </div>
                <div className="technical-font text-[10px] text-primary-dim bg-white/5 px-3 py-1">ALTITUDE: 60,000 FT (STABLE)</div>
              </div>
              <div className="h-64 flex items-end justify-between space-x-2 relative">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
                  <div className="border-t border-white w-full"></div>
                  <div className="border-t border-white w-full"></div>
                  <div className="border-t border-white w-full"></div>
                  <div className="border-t border-white w-full"></div>
                </div>
                <div className="flex-1 flex flex-col justify-end items-center"><div className="w-full bg-primary/20 h-[40%] border-t border-primary/60"></div><span className="technical-font text-[10px] mt-4 text-slate-500">MON</span></div>
                <div className="flex-1 flex flex-col justify-end items-center"><div className="w-full bg-primary/20 h-[65%] border-t border-primary/60"></div><span className="technical-font text-[10px] mt-4 text-slate-500">TUE</span></div>
                <div className="flex-1 flex flex-col justify-end items-center"><div className="w-full bg-primary/20 h-[50%] border-t border-primary/60"></div><span className="technical-font text-[10px] mt-4 text-slate-500">WED</span></div>
                <div className="flex-1 flex flex-col justify-end items-center"><div className="w-full bg-primary text-on-primary h-[92%] border-t-2 border-primary ring-1 ring-primary/20"></div><span className="technical-font text-[10px] mt-4 text-primary">THU</span></div>
                <div className="flex-1 flex flex-col justify-end items-center"><div className="w-full bg-primary/20 h-[78%] border-t border-primary/60"></div><span className="technical-font text-[10px] mt-4 text-slate-500">FRI</span></div>
                <div className="flex-1 flex flex-col justify-end items-center"><div className="w-full bg-primary/20 h-[30%] border-t border-primary/60"></div><span className="technical-font text-[10px] mt-4 text-slate-500">SAT</span></div>
                <div className="flex-1 flex flex-col justify-end items-center"><div className="w-full bg-primary/20 h-[25%] border-t border-primary/60"></div><span className="technical-font text-[10px] mt-4 text-slate-500">SUN</span></div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 bg-surface-container p-8 flex flex-col justify-between border-t border-white/5">
              <div>
                <h2 className="text-sm font-light tracking-widest text-secondary label-font uppercase">Signal Consistency</h2>
                <div className="mt-8 flex items-baseline space-x-2">
                  <span className="technical-font text-7xl font-light text-primary tracking-tighter">{totals.totalFocusTime || 0}</span>
                  <span className="technical-font text-xl text-secondary">s</span>
                </div>
                <div className="mt-4 flex items-center space-x-2 text-primary-dim">
                  <span className="material-symbols-outlined text-sm">arrow_upward</span>
                  <span className="technical-font text-[10px]">AGGREGATE METRICS</span>
                </div>
              </div>
              <div className="space-y-4 mt-12">
                <MonoStatRow label="Total Sessions" value={String(totals.totalSessions || 0)} />
                <MonoStatRow label="Distractions Blocked" value={String(totals.totalDistractions || 0)} />
                <MonoStatRow label="Most Blocked Domain" value={totals.mostBlocked || "—"} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
