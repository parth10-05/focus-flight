import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import StatusBadge from "@/components/shared/StatusBadge";
import { supabase } from "@/lib/supabase";

type FlightRow = {
  id: string;
  origin: string;
  destination: string;
  start_time: string | null;
  status: string;
};

type SessionRow = {
  actual_duration: number | null;
  distractions_blocked_count: number | null;
};

function formatDuration(value: number | null): string {
  if (!value || value <= 0) {
    return "00:00:00";
  }

  const seconds = value > 5000 ? value : value * 60;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

export default function Debrief(): JSX.Element {
  const { id: flightId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [flight, setFlight] = useState<FlightRow | null>(null);
  const [sessionLog, setSessionLog] = useState<SessionRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!flightId) {
      setIsLoading(false);
      return;
    }

    const load = async () => {
      setIsLoading(true);
      const [{ data: flightData, error: flightError }, { data: sessionData, error: sessionError }] = await Promise.all([
        supabase.from("flights").select("id, origin, destination, start_time, status").eq("id", flightId).maybeSingle(),
        supabase
          .from("sessions_log")
          .select("actual_duration, distractions_blocked_count")
          .eq("flight_id", flightId)
          .order("id", { ascending: false })
          .limit(1)
          .maybeSingle()
      ]);

      if (flightError) {
        console.error("Failed to fetch flight", flightError.message);
      }
      if (sessionError) {
        console.error("Failed to fetch session log", sessionError.message);
      }

      setFlight((flightData as FlightRow | null) ?? null);
      setSessionLog((sessionData as SessionRow | null) ?? null);
      setIsLoading(false);
    };

    void load();
  }, [flightId]);

  if (!flightId) {
    return <Navigate to="/logbook" replace />;
  }

  if (!isLoading && !flight) {
    return <Navigate to="/logbook" replace />;
  }

  const route = useMemo(() => {
    if (!flight) {
      return "Unknown";
    }
    return `${flight.origin} → ${flight.destination}`;
  }, [flight]);

  const dateText = useMemo(() => {
    if (!flight?.start_time) {
      return "—";
    }
    return new Date(flight.start_time).toLocaleString();
  }, [flight]);

  return (
    <div className="bg-background text-on-background font-body selection:bg-primary selection:text-on-primary min-h-screen flex flex-col overflow-hidden">
      <div className="fixed inset-0 grain-overlay z-50"></div>

      <main className="flex-grow flex flex-col items-center justify-center relative px-6 py-12">
        <div className="absolute inset-x-0 bottom-0 h-1/2 horizon-glow z-0"></div>
        <div className="relative z-10 w-full max-w-5xl flex flex-col items-center">
          <div className="text-center mb-16">
            <h1 className="font-serif italic text-6xl md:text-8xl tracking-[0.15em] text-primary mb-6">YOU'VE LANDED</h1>
            <p className="font-label text-secondary tracking-widest text-xs md:text-sm uppercase max-w-md mx-auto leading-relaxed">
              Your focus journey is complete. You are now re-entering the atmosphere.
            </p>
          </div>

          <div className="w-full h-64 mb-16 relative overflow-hidden flex items-center justify-center">
            <img className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale brightness-75 mix-blend-screen" data-alt="Cinematic wide shot of the Earth's curvature at dawn from space with deep blue shadows and a thin glowing atmosphere line" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCH2yHlvrtsNXYR4zCEXoFSRGs7qNoULcKyelFcnagRPNIJH-nM7PrAkizSTSR2NoyfqloPH4XiwePI8jyjYDa3Fmljgad42sReqSpLjZGtWGNB2rE2HYc1RgypNK8Rqb2WiSDE0B0BAGj2mwWjNGsWB7rM7eCfGBkiPzGYfUlS5kI1NYN6fFrnbutzB1mDumwoBrXOxnwvKhfR0lw8OpV_cIm1P83r4HBrazIhDr7dqp5iZe6oRLrbYz_PXBRH2qFtgZ-MIoXvCQL5" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background"></div>
            <div className="relative w-full max-w-2xl h-px bg-outline-variant/30 flex items-center justify-center">
              <div className="absolute w-2 h-2 bg-primary rotate-45"></div>
              <div className="absolute -top-12 text-[10px] font-mono tracking-tighter text-secondary flex flex-col items-center">
                <span>ALTITUDE: 0.0KM</span>
                <span className="opacity-50">STABLE_DESCENT</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-1 w-full border border-white/5 bg-white/5 mb-16">
            <div className="bg-surface p-8 flex flex-col justify-between aspect-square md:aspect-auto">
              <div className="flex items-center gap-2 mb-8">
                <span className="material-symbols-outlined text-secondary text-sm">flight_takeoff</span>
                <span className="font-label text-[10px] text-secondary-dim tracking-[0.2em] uppercase">Route Vector</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline font-light text-2xl tracking-tight text-primary">{flight?.origin ?? "Unknown"}</span>
                <span className="material-symbols-outlined text-outline-variant my-2">south</span>
                <span className="font-headline font-light text-2xl tracking-tight text-primary">{flight?.destination ?? "Unknown"}</span>
              </div>
            </div>
            <div className="bg-surface p-8 flex flex-col justify-between aspect-square md:aspect-auto">
              <div className="flex items-center gap-2 mb-8">
                <span className="material-symbols-outlined text-secondary text-sm">timer</span>
                <span className="font-label text-[10px] text-secondary-dim tracking-[0.2em] uppercase">Focus Duration</span>
              </div>
              <div className="flex flex-col items-start">
                <span className="font-mono text-4xl md:text-5xl text-primary-fixed tracking-tighter">{formatDuration(sessionLog?.actual_duration ?? null)}</span>
                <span className="font-label text-[10px] text-outline mt-2 tracking-widest">SESSION_LOG_COMPLETE</span>
              </div>
            </div>
            <div className="bg-surface p-8 flex flex-col justify-between aspect-square md:aspect-auto">
              <div className="flex items-center gap-2 mb-8">
                <span className="material-symbols-outlined text-secondary text-sm">signal_cellular_alt</span>
                <span className="font-label text-[10px] text-secondary-dim tracking-[0.2em] uppercase">Signal Stability</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <StatusBadge status={flight?.status ?? "unknown"} />
                  <span className="font-mono text-[10px] text-secondary">{dateText}</span>
                </div>
                <div className="font-mono text-2xl text-primary mt-4">{sessionLog?.distractions_blocked_count ?? 0}</div>
                <span className="font-label text-[10px] text-outline mt-2 tracking-widest">DISTRACTIONS_BLOCKED</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              className="group relative px-12 py-4 bg-primary text-on-primary font-label font-medium tracking-[0.3em] uppercase rounded-lg overflow-hidden transition-all duration-300 hover:bg-tertiary-container hover:pr-14"
              onClick={() => navigate("/preflight")}
            >
              <span className="relative z-10">NEW FLIGHT</span>
            </button>
            <button
              className="group relative px-12 py-4 bg-surface-container-low text-primary font-label font-medium tracking-[0.3em] uppercase rounded-lg overflow-hidden transition-all duration-300 hover:bg-surface-container"
              onClick={() => navigate("/logbook")}
            >
              <span className="relative z-10">VIEW LOGBOOK</span>
            </button>
            <button
              className="group relative px-12 py-4 bg-surface-container-low text-primary font-label font-medium tracking-[0.3em] uppercase rounded-lg overflow-hidden transition-all duration-300 hover:bg-surface-container"
              onClick={() => navigate("/analytics")}
            >
              <span className="relative z-10">ANALYTICS</span>
            </button>
          </div>
        </div>
      </main>

      <footer className="mt-auto bg-surface-container-low border-t border-white/5 py-4 px-8 flex flex-col md:flex-row justify-between items-center font-mono text-[10px] tracking-tighter text-outline select-none">
        <div className="flex items-center gap-4 mb-2 md:mb-0">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/40"></span>
            VANGUARD ONE CONNECTED
          </span>
          <span className="opacity-30">|</span>
          <span>{route}</span>
        </div>
        <div className="flex gap-6 uppercase">
          <span>{dateText}</span>
        </div>
      </footer>
    </div>
  );
}
