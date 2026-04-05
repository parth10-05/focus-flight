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
import { getUserProfile, saveLastBlockedSites } from "@/services/userProfileService";
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

  useEffect(() => {
    const preloadBlockedSites = async () => {
      try {
        const profile = await getUserProfile();
        if (!profile?.last_blocked_sites?.length) {
          return;
        }

        setBlockedSites((current) => (current.length > 0 ? current : profile.last_blocked_sites));
      } catch {
        // no-op: preflight should still be usable even if profile defaults fail to load
      }
    };

    void preloadBlockedSites();
  }, []);

  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<number | null>(null);
  const [blockedSites, setBlockedSites] = useState<string[]>([]);
  const [mode, setMode] = useState<"preset" | "custom">("custom");
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

      await saveLastBlockedSites(blockedSites);

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
      <main className="preflight-main px-6 md:px-12 py-8 md:py-10 min-h-screen">
        <div className="mx-auto w-full max-w-7xl">
          <form className="w-full" onSubmit={handleSubmit}>
            <header className="mb-12 md:mb-14">
              <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <h1 className="font-light text-4xl md:text-5xl tracking-[0.15em] text-on-surface uppercase">Mission Vectors</h1>
                  <p className="font-mono text-[11px] text-on-surface-variant mt-2 tracking-[0.14em] uppercase">STRATOS_SURVEILLANCE_SYSTEM // PRESET_ARCHIVE_09</p>
                </div>

                <div className="preflight-mode-tabs">
                  <button
                    type="button"
                    className={`preflight-mode-tab ${mode === "preset" ? "is-active" : ""}`}
                    onClick={() => handleModeSwitch("preset")}
                  >
                    PRESET VECTORS
                  </button>
                  <button
                    type="button"
                    className={`preflight-mode-tab ${mode === "custom" ? "is-active" : ""}`}
                    onClick={() => handleModeSwitch("custom")}
                  >
                    CUSTOM MISSION
                  </button>
                </div>
              </div>
            </header>

            <section className="preflight-panel preflight-panel-main">
              <div className="preflight-panel-code">COORD_SYS: ST-04</div>

              {mode === "preset" ? (
                <div className="mb-8">
                  <div className="preflight-panel-label mb-3">SELECT ROUTE // AUTO-FILLS MISSION PARAMETERS</div>
                  <RouteSelector onSelect={handleRouteSelect} selectedId={selectedRouteId} />
                </div>
              ) : null}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                <div className="space-y-8">
                  <div>
                    <label className="preflight-field-label">Departure Vector</label>
                    <input
                      className={`preflight-text-input ${errors.origin ? "is-error" : ""}`}
                      placeholder="FOCUS_HUB_ALPHA"
                      type="text"
                      value={origin}
                      onChange={(event) => setOrigin(event.target.value)}
                    />
                    {errors.origin ? <p className="preflight-field-error">{errors.origin}</p> : null}
                  </div>

                  <div>
                    <label className="preflight-field-label">Arrival Destination</label>
                    <input
                      className={`preflight-text-input ${errors.destination ? "is-error" : ""}`}
                      placeholder="DEEP_WORK_EPSILON"
                      type="text"
                      value={destination}
                      onChange={(event) => setDestination(event.target.value)}
                    />
                    {errors.destination ? <p className="preflight-field-error">{errors.destination}</p> : null}
                  </div>
                </div>

                <div className="flex flex-col justify-between gap-8">
                  <div>
                    <label className="preflight-field-label">Flight Duration (MIN)</label>
                    <div className="flex items-end gap-4 mb-2">
                      <span className="font-mono text-4xl text-on-surface font-light">{durationDisplay ?? "--"}</span>
                      <span className="font-mono text-xs text-on-surface-variant pb-1 tracking-[0.1em]">T-MINUS</span>
                    </div>
                    <input
                      className={`preflight-duration-slider w-full appearance-none bg-transparent cursor-pointer ${errors.duration ? "[&::-webkit-slider-runnable-track]:bg-[#ee7d77]" : ""}`}
                      max={240}
                      min={15}
                      type="range"
                      value={durationDisplay ?? 15}
                      onChange={(event) => setDurationMinutes(Number(event.target.value))}
                    />
                    {errors.duration ? <p className="preflight-field-error">{errors.duration}</p> : null}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <TelemetryTile label="Ox Level" value="98.2%" />
                    <TelemetryTile label="Signal" value="LOCKED" />
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 preflight-panel">
                <h3 className="font-label text-[11px] tracking-[0.2em] text-on-surface uppercase mb-5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">security</span>
                  Blocked Sectors
                </h3>

                <div className="flex flex-wrap gap-3">
                  {blockedSites.map((domain, index) => (
                    <BlockedSectorChip key={`${domain}-${index}`} label={domain} onRemove={() => removeBlockedDomain(index)} />
                  ))}

                  <button className="preflight-add-domain" type="button" onClick={addBlockedDomain}>
                    <span className="material-symbols-outlined text-sm">add</span>
                    ADD DOMAIN
                  </button>
                </div>
              </div>

              <button className="preflight-submit-btn" type="submit" disabled={isSubmitting}>
                <span className="material-symbols-outlined text-3xl font-light">rocket_launch</span>
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] font-bold">{isSubmitting ? "Starting Flight" : "Initiate Vector"}</div>
                  <div className="font-mono text-[10px] opacity-70 tracking-[0.08em]">{isSubmitting ? "EXECUTING..." : "EXECUTE_SILENCE_PROTOCOL"}</div>
                </div>
              </button>
            </section>

            {errors.submit ? <p className="mt-4 font-mono text-[10px] text-error">{errors.submit}</p> : null}

            <footer className="mt-12 preflight-footer-overlay">
              <div className="flex flex-wrap gap-x-12 gap-y-5">
                <FooterMetric label="Vectors Cached" value={PRESET_ROUTES.length.toLocaleString()} />
                <FooterMetric label="Active Fleet" value="84" />
                <FooterMetric label="System Status" value="Stable" withPulse />
              </div>

              <div className="flex items-center gap-5">
                <span className="font-mono text-[11px] text-on-surface-variant uppercase tracking-[0.12em]">Last sync: 04:20:11 UTC</span>
                <button className="preflight-refresh-btn" type="button">
                  REFRESH ARCHIVE
                </button>
              </div>
            </footer>
          </form>
        </div>
      </main>
    </div>
  );
}
