import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import BlockedSectorChip from "@/components/preflight/BlockedSectorChip";
import FooterMetric from "@/components/preflight/FooterMetric";
import { RouteSelector } from "@/components/preflight/RouteSelector";
import TelemetryTile from "@/components/preflight/TelemetryTile";
import type { PresetRoute } from "@/data/flightRoutes";
import { PRESET_ROUTES } from "@/data/flightRoutes";
import "@/components/preflight/preflight.css";
import { getActiveFlight } from "@/services/flightService";
import { useFlightStore } from "@/store/useFlightStore";

interface PreFlightErrors {
  origin?: string;
  destination?: string;
  duration?: string;
  submit?: string;
}

export default function PreFlight(): JSX.Element {
  const navigate = useNavigate();
  const startFlight = useFlightStore((state) => state.startFlight);

  useEffect(() => {
    const redirectIfActiveFlightExists = async () => {
      const activeFlight = await getActiveFlight();
      if (activeFlight?.id) {
        navigate(`/flight/${activeFlight.id}`, { replace: true });
      }
    };

    void redirectIfActiveFlightExists();
  }, [navigate]);

  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<number | null>(null);
  const [blockedSites, setBlockedSites] = useState<string[]>([]);
  const [mode, setMode] = useState<"preset" | "custom">("preset");
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<PreFlightErrors>({});

  const durationDisplay = useMemo(() => {
    if (durationMinutes === null) {
      return null;
    }

    return Math.max(1, Math.round(durationMinutes));
  }, [durationMinutes]);

  const selectedRoute = useMemo(
    () => PRESET_ROUTES.find((route) => route.id === selectedRouteId) ?? null,
    [selectedRouteId]
  );

  const addBlockedDomain = () => {
    const nextDomain = window.prompt("Enter domain to block");
    if (!nextDomain) {
      return;
    }

    const normalized = nextDomain.trim();
    if (!normalized) {
      return;
    }

    setBlockedSites((prev) => [...prev, normalized]);
  };

  const removeBlockedDomain = (indexToRemove: number) => {
    setBlockedSites((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleRouteSelect = (route: PresetRoute) => {
    setSelectedRouteId(route.id);
    setOrigin(route.origin);
    setDestination(route.destination);
    setDurationMinutes(route.durationMinutes);
  };

  const handleModeSwitch = (newMode: "preset" | "custom") => {
    setMode(newMode);

    if (newMode === "custom") {
      setSelectedRouteId(null);
      setOrigin("");
      setDestination("");
      setDurationMinutes(null);
    }
  };

  const validate = (): boolean => {
    const nextErrors: PreFlightErrors = {};

    if (!origin.trim()) {
      nextErrors.origin = "Departure Vector is required";
    }

    if (!destination.trim()) {
      nextErrors.destination = "Arrival Destination is required";
    }

    if (durationMinutes === null || durationMinutes <= 0) {
      nextErrors.duration = "Flight Duration is required";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) {
      return;
    }

    if (durationDisplay === null) {
      setErrors({ duration: "Flight Duration is required" });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const flight = await startFlight({
        origin: origin.trim(),
        destination: destination.trim(),
        duration: durationDisplay * 60,
        blockedSites,
        aircraftType: selectedRoute?.aircraft,
        distanceKm: selectedRoute?.distanceKm
      });

      navigate(`/flight/${flight.id}`);
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("ACTIVE_FLIGHT_EXISTS:")) {
        const [, activeFlightId] = error.message.split(":");
        if (activeFlightId) {
          navigate(`/flight/${activeFlightId}`, { replace: true });
          return;
        }
      }

      setErrors({
        submit: error instanceof Error ? error.message : "Failed to start flight"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="preflight-page text-on-background overflow-x-hidden">
      <main className="px-12 py-10 min-h-screen">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <header className="text-center mb-16">
            <h1 className="text-5xl font-light tracking-[0.2em] text-primary uppercase mb-4">Plan Your Flight</h1>
            <div className="h-[1px] w-24 bg-outline-variant/30 mx-auto mb-4"></div>
            <p className="text-secondary font-light tracking-[0.1em] text-xs uppercase">Configuration for Stratospheric Silence session</p>
          </header>

          <form className="w-full grid grid-cols-12 gap-8" onSubmit={handleSubmit}>
            <section className="col-span-12 bg-surface-container-low p-10 border-l border-primary/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 font-mono text-[10px] text-primary/20 tracking-tighter">COORD_SYS: ST-04</div>

              <div style={{ display: "flex", gap: "0", marginBottom: "24px" }}>
                <button
                  type="button"
                  onClick={() => handleModeSwitch("preset")}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    letterSpacing: "0.1em",
                    padding: "8px 20px",
                    background: mode === "preset" ? "var(--color-accent-blue)" : "var(--color-elevated)",
                    color: mode === "preset" ? "var(--color-base)" : "var(--color-text-muted)",
                    border: "none",
                    borderRadius: "var(--radius-small) 0 0 var(--radius-small)",
                    cursor: "pointer"
                  }}
                >
                  PRESET ROUTES
                </button>
                <button
                  type="button"
                  onClick={() => handleModeSwitch("custom")}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    letterSpacing: "0.1em",
                    padding: "8px 20px",
                    background: mode === "custom" ? "var(--color-accent-blue)" : "var(--color-elevated)",
                    color: mode === "custom" ? "var(--color-base)" : "var(--color-text-muted)",
                    border: "none",
                    borderRadius: "0 var(--radius-small) var(--radius-small) 0",
                    cursor: "pointer"
                  }}
                >
                  CUSTOM MISSION
                </button>
              </div>

              {mode === "preset" ? (
                <div style={{ marginBottom: "28px" }}>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "10px",
                      letterSpacing: "0.12em",
                      color: "var(--color-text-muted)",
                      marginBottom: "12px"
                    }}
                  >
                    SELECT ROUTE // AUTO-FILLS MISSION PARAMETERS
                  </div>
                  <RouteSelector onSelect={handleRouteSelect} selectedId={selectedRouteId} />
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="group">
                    <label className="block font-label text-[10px] text-secondary tracking-[0.15em] uppercase mb-2">Departure Vector</label>
                    <input
                      className={`w-full bg-transparent border-b-2 ${errors.origin ? "border-[#ee7d77]" : "border-outline-variant"} focus:border-primary outline-none py-2 font-mono text-sm tracking-widest text-on-surface transition-all`}
                      placeholder="FOCUS_HUB_ALPHA"
                      type="text"
                      value={origin}
                      onChange={(event) => setOrigin(event.target.value)}
                    />
                    {errors.origin ? <p className="mt-2 font-mono text-[10px] text-error">{errors.origin}</p> : null}
                  </div>
                  <div className="group">
                    <label className="block font-label text-[10px] text-secondary tracking-[0.15em] uppercase mb-2">Arrival Destination</label>
                    <input
                      className={`w-full bg-transparent border-b-2 ${errors.destination ? "border-[#ee7d77]" : "border-outline-variant"} focus:border-primary outline-none py-2 font-mono text-sm tracking-widest text-on-surface transition-all`}
                      placeholder="DEEP_WORK_EPSILON"
                      type="text"
                      value={destination}
                      onChange={(event) => setDestination(event.target.value)}
                    />
                    {errors.destination ? <p className="mt-2 font-mono text-[10px] text-error">{errors.destination}</p> : null}
                  </div>
                </div>

                <div className="flex flex-col justify-between">
                  <div>
                    <label className="block font-label text-[10px] text-secondary tracking-[0.15em] uppercase mb-4">Flight Duration (MIN)</label>
                    <div className="flex items-end gap-4 mb-2">
                      <span className="font-mono text-4xl text-primary font-light">{durationDisplay ?? "--"}</span>
                      <span className="font-mono text-xs text-secondary pb-1">T-MINUS</span>
                    </div>
                    <input
                      className={`preflight-duration-slider w-full appearance-none bg-transparent cursor-pointer ${errors.duration ? "[&::-webkit-slider-runnable-track]:bg-[#ee7d77]" : ""}`}
                      max={240}
                      min={15}
                      type="range"
                      value={durationDisplay ?? 15}
                      onChange={(event) => setDurationMinutes(Number(event.target.value))}
                    />
                    {errors.duration ? <p className="mt-2 font-mono text-[10px] text-error">{errors.duration}</p> : null}
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-8">
                    <TelemetryTile label="Ox Level" value="98.2%" />
                    <TelemetryTile label="Signal" value="LOCKED" />
                  </div>
                </div>
              </div>
            </section>

            <section className="col-span-12 grid grid-cols-3 gap-6">
              <div className="col-span-2 bg-surface-container-low p-6 flex flex-col justify-between">
                <div>
                  <h3 className="font-label text-xs tracking-[0.2em] text-primary uppercase mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">security</span>
                    Blocked Sectors
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {blockedSites.map((domain, index) => (
                      <BlockedSectorChip key={`${domain}-${index}`} label={domain} onRemove={() => removeBlockedDomain(index)} />
                    ))}
                    <button className="px-3 py-1 border border-primary/40 border-dashed hover:border-primary transition-colors" type="button" onClick={addBlockedDomain}>
                      <span className="material-symbols-outlined text-[10px] text-primary">add</span>
                    </button>
                  </div>
                </div>
              </div>

              <button
                className="col-span-1 bg-primary p-6 flex flex-col justify-between items-start text-on-primary group cursor-pointer hover:bg-tertiary transition-colors text-left disabled:opacity-70 disabled:cursor-not-allowed"
                type="submit"
                disabled={isSubmitting}
              >
                <span className="material-symbols-outlined text-3xl font-light">rocket_launch</span>
                <div>
                  <div className="font-bold tracking-[0.2em] text-xs uppercase">{isSubmitting ? "Starting Flight" : "Commit Flight"}</div>
                  <div className="font-mono text-[9px] opacity-70">{isSubmitting ? "EXECUTING..." : "EXECUTE_SILENCE_PROTOCOL"}</div>
                </div>
              </button>
            </section>

            {errors.submit ? <p className="col-span-12 font-mono text-[10px] text-error">{errors.submit}</p> : null}

            <div className="col-span-12 h-64 mt-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-surface-dim to-transparent z-10"></div>
              <img
                className="w-full h-full object-cover grayscale opacity-30"
                data-alt="dramatic view of earth from space with atmospheric glow and dark void background"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWRmpU9-eZWovurdOYwh-15AqLGmmYTnB-FTBF0oSHw8y3Y-cQ28fcNhb12nNFtfoaQYZT0wA9kL4q0CFQpXzwkKxml6W5xUnAfeAY97oNHQF6y-U9e-ukRpxFj_6G9buaej1wKDjEYiGzQLHinmE8251_UtEMDxF-NOw9WqCqN2NianHc_IewdVZ1Nkk59KzTqsJySUMSCV5FLrNzNQDoaAkdQgTX5DjW7LxiLmTBL72EzcvTCEUlg5bkqZ93xtuGQXIOJfUvWYPx"
              />
              <div className="absolute bottom-8 left-8 z-20 space-y-1">
                <div className="font-mono text-[10px] text-primary/60 tracking-[0.3em] uppercase">Current Visibility: Absolute</div>
                <div className="font-mono text-[10px] text-primary/40 tracking-[0.3em] uppercase">Sector: 00-VOID</div>
              </div>
            </div>
          </form>
        </div>
      </main>

      <footer className="p-8 border-t border-outline-variant/10 flex justify-between items-center">
        <div className="flex gap-12">
          <FooterMetric label="System Status" value="Nominal" withPulse />
          <FooterMetric label="Neural Load" value="0.04 MS" />
        </div>
        <div className="font-mono text-[9px] text-secondary/40">© 2024 AEROFOCUS TECHNOLOGY SYSTEMS</div>
      </footer>
    </div>
  );
}
