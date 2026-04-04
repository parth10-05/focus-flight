import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import BlockedSiteTag from "@/components/flight/BlockedSiteTag";
import FooterTelemetryItem from "@/components/flight/FooterTelemetryItem";
import OverlayMetric from "@/components/flight/OverlayMetric";
import StatusDotLabel from "@/components/flight/StatusDotLabel";
import "@/components/flight/activeFlight.css";
import { PRESET_ROUTES } from "@/data/flightRoutes";
import { useDistractionsCount } from "@/hooks/useDistractionsCount";
import { useElapsedTime } from "@/hooks/useElapsedTime";
import { subscribeToFlightChanges } from "@/services/flightService";
import { useFlightStore } from "@/store/useFlightStore";
import type { Flight } from "@/types";

function formatElapsedTime(elapsedMs: number): string {
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
}

export default function ActiveFlight(): JSX.Element {
  const { id: flightIdParam } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const currentFlight = useFlightStore((state) => state.currentFlight);
  const blockedSites = useFlightStore((state) => state.blockedSites);
  const aircraftType = useFlightStore((state) => state.aircraftType);
  const distanceKm = useFlightStore((state) => state.distanceKm);
  const syncWithBackend = useFlightStore((state) => state.syncWithBackend);
  const endFlight = useFlightStore((state) => state.endFlight);

  const [isSyncing, setIsSyncing] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isEnding, setIsEnding] = useState<"completed" | "aborted" | null>(null);
  const [istTime, setIstTime] = useState("--:--:--");

  const distractionsCount = useDistractionsCount(flightIdParam ?? currentFlight?.id ?? null);
  const elapsedMs = useElapsedTime(currentFlight?.start_time ?? null);

  useEffect(() => {
    const ensureFlight = async () => {
      if (!currentFlight) {
        await syncWithBackend("");
      }
      setIsSyncing(false);
    };

    void ensureFlight();
  }, [currentFlight, syncWithBackend]);

  useEffect(() => {
    const updateIstTime = () => {
      const next = new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      }).format(new Date());

      setIstTime(next);
    };

    updateIstTime();
    const intervalId = window.setInterval(updateIstTime, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToFlightChanges((flight: Flight) => {
      if (flight.status !== "active") {
        return;
      }

      if (flightIdParam && flight.id !== flightIdParam) {
        return;
      }

      useFlightStore.setState({ currentFlight: flight, isActive: true });
    });

    return unsubscribe;
  }, [flightIdParam]);

  const routeLabel = useMemo(() => {
    if (!currentFlight) {
      return "UNKNOWN → UNKNOWN";
    }

    return `${currentFlight.origin.toUpperCase()} → ${currentFlight.destination.toUpperCase()}`;
  }, [currentFlight]);

  const canRenderActiveFlight = currentFlight && currentFlight.status === "active" && (!flightIdParam || currentFlight.id === flightIdParam);

  const presetRouteMatch = useMemo(() => {
    if (!currentFlight) {
      return null;
    }

    const origin = currentFlight.origin.toUpperCase();
    const destination = currentFlight.destination.toUpperCase();

    return PRESET_ROUTES.find(
      (route) => route.origin.toUpperCase() === origin && route.destination.toUpperCase() === destination
    ) ?? null;
  }, [currentFlight]);

  const resolvedAircraftType = aircraftType ?? presetRouteMatch?.aircraft ?? "UNSPECIFIED";
  const resolvedDistanceKm = distanceKm ?? presetRouteMatch?.distanceKm ?? null;

  const telemetry = useMemo(() => {
    const telemetryElapsedMs = Math.floor(elapsedMs / 10000) * 10000;
    const phaseMinutes = telemetryElapsedMs / 60000;

    const altitudeFt = Math.max(
      30000,
      Math.round((59000 + Math.sin(phaseMinutes / 6) * 180 + Math.cos(phaseMinutes / 11) * 90) / 10) * 10
    );

    const speedMach = Math.max(0.72, 1.84 + Math.sin(phaseMinutes / 8) * 0.05);

    const missionSeconds = currentFlight?.duration ?? 0;
    const progress = missionSeconds > 0 ? Math.min(1, (telemetryElapsedMs / 1000) / missionSeconds) : 0;
    const fuelPct = Math.max(5, Math.min(100, 100 - progress * 88 + Math.sin(phaseMinutes / 10) * 0.4));

    return {
      altitudeLabel: `${altitudeFt.toLocaleString()} FT`,
      speedLabel: `MACH ${speedMach.toFixed(2)}`,
      fuelLabel: `${Math.round(fuelPct)}%`
    };
  }, [currentFlight?.duration, elapsedMs]);

  const handleEndFlight = async (status: "completed" | "aborted") => {
    if (!currentFlight) {
      return;
    }

    setIsEnding(status);
    setActionError(null);

    try {
      await endFlight(status);
      navigate(`/debrief/${currentFlight.id}`);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Failed to complete flight action");
    } finally {
      setIsEnding(null);
    }
  };

  if (!isSyncing && !canRenderActiveFlight) {
    return <Navigate to="/logbook" replace />;
  }

  if (!currentFlight) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="active-flight-page font-body selection:bg-primary/30 h-screen flex flex-col bg-[#08090A] text-[#c1c7ce] overflow-hidden">
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-16 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <span className="text-xs font-mono tracking-[0.2em] text-secondary">OS_VANGUARD // ALPHA</span>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
          <span className="font-mono text-[10px] tracking-[0.3em] text-secondary mb-1">CURRENT TRAJECTORY</span>
          <h1 className="font-mono text-sm tracking-[0.15em] text-primary bg-surface-container-low/40 px-4 py-1 rounded-sm border border-outline-variant/10">
            {routeLabel}
          </h1>
        </div>
        <div className="pointer-events-auto flex items-center gap-3">
          <button
            className="font-label text-[10px] tracking-widest text-primary/70 border border-primary/30 px-4 py-2 hover:bg-primary/10 hover:text-primary transition-all duration-300 uppercase disabled:opacity-60"
            onClick={() => void handleEndFlight("completed")}
            disabled={Boolean(isEnding)}
          >
            {isEnding === "completed" ? "LANDING" : "LAND"}
          </button>
          <button
            className="font-label text-[10px] tracking-widest text-error/60 border border-error/20 px-4 py-2 hover:bg-error/10 hover:text-error transition-all duration-300 uppercase disabled:opacity-60"
            onClick={() => void handleEndFlight("aborted")}
            disabled={Boolean(isEnding)}
          >
            {isEnding === "aborted" ? "ABORTING" : "ABORT PROTOCOL"}
          </button>
        </div>
      </header>

      <main className="flex-grow relative flex items-center justify-center p-12">
        <div className="absolute inset-0 z-0 opacity-40 grayscale contrast-125">
          <div className="w-full h-full bg-[#08090A] relative overflow-hidden">
            <img
              alt="Dark satellite view of earth from extreme altitude"
              className="w-full h-full object-cover mix-blend-luminosity opacity-20"
              data-alt="Cinematic dark satellite imagery of earth at night, deep blacks and subtle navy shadows, high-contrast topological details, moody lighting"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-5BQShyOe_dgkd9mj-wmYUVdLH5xmxXh1Wsol_FYQadNonbWIadLPuQ26Zemk6FejnYKYmWxhpP7wYhEl1XyA1Y0OW_x9WXBe_qSTa40wsGvo2PiV2EuCmnkhlOY8unFpz6RWbxpnPcvUZ7uUrtfD2W9bNGl7tGqPmOSaV9rzQPWcVE2x8pOz6yYM-PfyRmwKht3ABo96eaHlQ2k2H8vmY2FGcivqHJ7dMPcY-bVChYY7mxkrZ68E7txqrTlWHYkdDD3gB_U-Znu2"
            />
            <svg className="absolute inset-0 w-full h-full z-10" viewBox="0 0 1000 600">
              <path className="route-glow" d="M 300 450 Q 500 100 800 150" fill="none" stroke="#c1c7ce" strokeDasharray="4 4" strokeWidth="0.5"></path>
              <circle className="animate-pulse shadow-lg" cx="540" cy="210" fill="#c1c7ce" r="3"></circle>
              <path d="M 540 210 L 530 220 L 540 215 L 550 220 Z" fill="#c1c7ce" transform="rotate(-45 540 210)"></path>
            </svg>
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="mb-2 flex items-center gap-4">
            <span className="h-[1px] w-12 bg-outline-variant/30"></span>
            <span className="font-label text-[10px] tracking-[0.4em] text-secondary">REMAINING DURATION</span>
            <span className="h-[1px] w-12 bg-outline-variant/30"></span>
          </div>
          <div className="font-mono text-[120px] leading-none tracking-tighter text-primary font-light text-glow">
            {formatElapsedTime(elapsedMs)}
          </div>
          <div className="mt-4 flex gap-8">
            <StatusDotLabel label="Uplink Active" pulsing />
            <StatusDotLabel label="Phase: Cruise" />
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-xl">
            {blockedSites.map((site, index) => (
              <BlockedSiteTag key={`${site}-${index}`} site={site} />
            ))}
          </div>
          {actionError ? <p className="mt-4 font-mono text-[10px] text-error uppercase tracking-widest">{actionError}</p> : null}
        </div>

        <div className="absolute bottom-16 left-16 z-20">
          <div className="flex flex-col gap-4">
            <div className="space-y-1">
              <p className="font-label text-[9px] tracking-[0.2em] text-secondary uppercase">Local Time (IST)</p>
              <p className="font-mono text-lg text-primary">{istTime} <span className="text-xs text-secondary-dim">UTC+5:30</span></p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-16 right-16 z-20">
          <div className="flex flex-col gap-8 items-end">
            <div className="grid grid-cols-2 gap-x-12 gap-y-4">
              <OverlayMetric label="Aircraft" value={resolvedAircraftType} />
              <OverlayMetric label="Distance" value={resolvedDistanceKm ? `${resolvedDistanceKm.toLocaleString()} KM` : "--"} />
              <OverlayMetric label="Altitude" value={telemetry.altitudeLabel} />
              <OverlayMetric label="Fuel" value={telemetry.fuelLabel} />
              <OverlayMetric label="Distractions" value={String(distractionsCount)} />
            </div>
            <div className="h-[1px] w-48 bg-gradient-to-l from-primary/40 to-transparent"></div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary text-sm" data-icon="radar">radar</span>
              <span className="font-mono text-[10px] tracking-[0.2em] text-secondary uppercase">Scanning Airspace</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 w-full z-50 h-10 border-t border-primary/5 bg-background flex justify-around items-center px-12">
        <FooterTelemetryItem icon="height" label={`ALT: ${telemetry.altitudeLabel.replace(" FT", "")}`} />
        <FooterTelemetryItem icon="speed" label={`SPD: ${telemetry.speedLabel}`} />
        <FooterTelemetryItem icon="water_drop" label={`FUEL: ${telemetry.fuelLabel}`} />
        <FooterTelemetryItem icon="radar" label={`SIG: ${distractionsCount > 0 ? "ACTIVE" : "STABLE"}`} active />
      </footer>

      <div className="fixed inset-0 pointer-events-none z-40 opacity-[0.03]">
        <div className="w-full h-[2px] bg-primary animate-scan absolute top-0"></div>
      </div>
    </div>
  );
}
