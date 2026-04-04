import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import StatusBadge from "@/components/shared/StatusBadge";
import { supabase } from "@/lib/supabase";

type Row = {
  id: string;
  actual_duration: number | null;
  flights: {
    id: string;
    origin: string;
    destination: string;
    start_time: string | null;
    status: string;
  } | null;
};

function formatDate(value: string | null): string {
  if (!value) {
    return "—";
  }
  const d = new Date(value);
  const date = d.toISOString().slice(0, 10).replace(/-/g, ".");
  const time = d.toTimeString().slice(0, 5);
  return `${date} | ${time}`;
}

function formatDuration(value: number | null): string {
  if (!value || value <= 0) {
    return "00.0 HRS";
  }

  const seconds = value > 5000 ? value : value * 60;
  const hours = seconds / 3600;
  return `${hours.toFixed(1).padStart(4, "0")} HRS`;
}

export default function Logbook(): JSX.Element {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
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

      const normalizedRows = ((data as unknown[]) ?? []).map((item) => {
        const raw = item as {
          id: string;
          actual_duration: number | null;
          flights: Row["flights"] | Array<NonNullable<Row["flights"]>>;
        };

        const flight = Array.isArray(raw.flights) ? raw.flights[0] ?? null : raw.flights;

        return {
          id: raw.id,
          actual_duration: raw.actual_duration,
          flights: flight
        } as Row;
      });

      setRows(normalizedRows);
      setCount(total ?? 0);
    };

    void load();
  }, [page]);

  const canPrev = page > 0;
  const canNext = useMemo(() => (page + 1) * 10 < count, [count, page]);

  return (
    <div className="bg-background text-on-background selection:bg-primary selection:text-on-primary min-h-screen">
      <nav className="fixed top-0 w-full z-50 bg-[#0d0e0f] dark:bg-[#0d0e0f] opacity-70 backdrop-blur-lg border-b border-[#c1c7ce]/10 flex justify-between items-center px-8 h-16">
        <button className="text-xl font-light tracking-[0.2em] text-[#c1c7ce] bg-transparent border-0 p-0" onClick={() => navigate("/logbook")} type="button">Flight Mode</button>
        <div className="hidden md:flex gap-8 items-center h-full">
          <button className="text-[#939eb4] font-light tracking-[0.1em] text-sm font-sans hover:text-[#e4ebff] transition-colors duration-150 bg-transparent border-0 p-0" onClick={() => navigate("/preflight")} type="button">Hangar</button>
          <span className="text-[#c1c7ce] border-b-2 border-[#c1c7ce] pb-1 font-light tracking-[0.1em] text-sm font-sans">Logbook</span>
          <button className="text-[#939eb4] font-light tracking-[0.1em] text-sm font-sans hover:text-[#e4ebff] transition-colors duration-150 bg-transparent border-0 p-0" onClick={() => navigate("/analytics")} type="button">Analytics</button>
        </div>
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-[#c1c7ce] cursor-pointer hover:text-[#e4ebff] transition-all">settings</span>
          <span className="material-symbols-outlined text-[#c1c7ce] cursor-pointer hover:text-[#e4ebff] transition-all">account_circle</span>
        </div>
      </nav>

      <aside className="fixed left-0 top-16 h-full w-64 border-r border-[#c1c7ce]/10 bg-[#0d0e0f] dark:bg-[#0d0e0f] opacity-70 backdrop-blur-xl flex flex-col py-6 px-4 hidden lg:flex">
        <div className="mb-10 px-2">
          <div className="font-mono text-[11px] tracking-widest text-secondary uppercase opacity-50">Command Center</div>
          <div className="text-primary font-headline font-light tracking-[0.1em] text-lg">STRATOS</div>
          <div className="font-mono text-[10px] text-secondary">Vanguard 01</div>
        </div>
        <div className="flex-1 space-y-1">
          <button className="w-full text-left flex items-center gap-3 px-3 py-2 text-[#939eb4] hover:bg-[#c1c7ce]/5 transition-all duration-150 font-mono text-[11px] tracking-tight bg-transparent border-0" onClick={() => navigate("/preflight")} type="button"><span className="material-symbols-outlined text-sm">flight_takeoff</span>Pre-Flight</button>
          <span className="flex items-center gap-3 px-3 py-2 bg-[#c1c7ce]/10 text-[#c1c7ce] border-l-2 border-[#c1c7ce] font-mono text-[11px] tracking-tight"><span className="material-symbols-outlined text-sm">radar</span>Active Duty</span>
          <button className="w-full text-left flex items-center gap-3 px-3 py-2 text-[#939eb4] hover:bg-[#c1c7ce]/5 transition-all duration-150 font-mono text-[11px] tracking-tight bg-transparent border-0" onClick={() => navigate("/analytics")} type="button"><span className="material-symbols-outlined text-sm">flight_land</span>Post-Flight</button>
        </div>
      </aside>

      <main className="lg:ml-64 pt-24 px-8 pb-12 min-h-screen">
        <header className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-6xl font-headline font-light tracking-[0.15em] text-primary mb-2">FLIGHT LOGBOOK</h1>
              <p className="font-label text-secondary text-sm tracking-widest uppercase">Archival mission data // Sequence 882-Alpha</p>
            </div>
            <div className="bg-surface-container-high p-4 border-l border-primary/30 flex items-center gap-4">
              <span className="material-symbols-outlined text-primary">warning</span>
              <div className="font-mono text-[11px] leading-tight">
                <span className="block text-secondary">SYSTEM STATUS</span>
                <span className="block text-primary">ALL SYSTEMS NOMINAL</span>
              </div>
            </div>
          </div>
        </header>

        <section className="bg-surface-container-low border border-outline-variant/10">
          <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
            <h2 className="font-label text-xs tracking-[0.2em] text-primary uppercase">Recent Deployments</h2>
            <div className="flex gap-4">
              <button className="font-mono text-[10px] text-secondary" disabled={!canPrev} onClick={() => setPage((p) => Math.max(0, p - 1))}>PREV</button>
              <button className="font-mono text-[10px] text-secondary" disabled={!canNext} onClick={() => setPage((p) => p + 1)}>NEXT</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="font-mono text-[10px] text-secondary tracking-widest border-b border-outline-variant/10">
                  <th className="px-6 py-4 font-normal">DATE / TIME</th>
                  <th className="px-6 py-4 font-normal">ROUTE</th>
                  <th className="px-6 py-4 font-normal">DURATION</th>
                  <th className="px-6 py-4 font-normal">STATUS</th>
                  <th className="px-6 py-4 font-normal text-right">TELEMETRY</th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-primary/5 transition-colors group cursor-pointer" onClick={() => row.flights?.id && navigate(`/debrief/${row.flights.id}`)}>
                    <td className="px-6 py-5 text-secondary">{formatDate(row.flights?.start_time ?? null)}</td>
                    <td className="px-6 py-5 text-primary">{row.flights?.origin ?? "Unknown"} <span className="material-symbols-outlined text-[10px] mx-1">arrow_forward</span> {row.flights?.destination ?? "Unknown"}</td>
                    <td className="px-6 py-5">{formatDuration(row.actual_duration)}</td>
                    <td className="px-6 py-5"><StatusBadge status={row.flights?.status ?? "unknown"} /></td>
                    <td className="px-6 py-5 text-right"><span className="material-symbols-outlined text-sm text-secondary group-hover:text-primary transition-all">monitoring</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-6 bg-surface-container-lowest flex justify-center border-t border-outline-variant/10">
            <button className="font-label text-[10px] tracking-[0.3em] text-primary hover:text-tertiary transition-all uppercase disabled:opacity-50" disabled={!canNext} onClick={() => setPage((p) => p + 1)} type="button">Load Historical Archives</button>
          </div>
        </section>
      </main>
    </div>
  );
}
