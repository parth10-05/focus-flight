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
    return "00:00";
  }

  const totalMinutes = value > 5000 ? Math.floor(value / 60) : Math.floor(value);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
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
    <div className="text-on-background selection:bg-primary selection:text-on-primary">
      <main className="px-8 py-10 pb-12 min-h-screen">
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
