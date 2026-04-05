import { useEffect, useMemo, useState } from "react";

import { supabase } from "@/lib/supabase";
import { getUserProfile, saveDisplayName } from "@/services/userProfileService";

const PROFILE_CACHE_KEY = "aerofocus.profile.cache.v1";
const PROFILE_CACHE_TTL_MS = 5 * 60 * 1000;

type FlightRow = {
  id: string;
  status: string;
  start_time: string | null;
};

type SessionRow = {
  id: string;
  actual_duration: number | null;
  distractions_blocked_count: number | null;
  flight: {
    origin: string;
    destination: string;
    start_time: string | null;
    status: string;
  } | null;
};

type SessionRowRaw = {
  id: string;
  actual_duration: number | null;
  distractions_blocked_count: number | null;
  flight: SessionRow["flight"] | Array<NonNullable<SessionRow["flight"]>>;
};

type ProfileCachePayload = {
  displayName: string;
  pilotTag: string;
  sessions: SessionRow[];
  flights: FlightRow[];
  cachedAt: number;
};

function formatMinutesAsHours(minutes: number): string {
  const hours = minutes / 60;
  return `${hours.toFixed(1)} HRS`;
}

function formatDateShort(value: string | null): string {
  if (!value) {
    return "UNKNOWN";
  }

  return new Date(value).toISOString().slice(0, 10).replace(/-/g, ".");
}

function computeDayStreak(dates: string[]): number {
  if (dates.length === 0) {
    return 0;
  }

  const sorted = [...new Set(dates)].sort((a, b) => b.localeCompare(a));
  let streak = 1;

  for (let i = 1; i < sorted.length; i += 1) {
    const prev = new Date(`${sorted[i - 1]}T00:00:00.000Z`);
    const current = new Date(`${sorted[i]}T00:00:00.000Z`);
    const diffDays = Math.round((prev.getTime() - current.getTime()) / 86400000);

    if (diffDays !== 1) {
      break;
    }

    streak += 1;
  }

  return streak;
}

export default function Profile(): JSX.Element {
  const [displayName, setDisplayName] = useState("Pilot");
  const [nameInput, setNameInput] = useState("Pilot");
  const [pilotTag, setPilotTag] = useState("VANGUARD-01");
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [flights, setFlights] = useState<FlightRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSavingName, setIsSavingName] = useState(false);

  useEffect(() => {
    const applyCacheIfAvailable = (): boolean => {
      try {
        const raw = window.localStorage.getItem(PROFILE_CACHE_KEY);
        if (!raw) {
          return false;
        }

        const parsed = JSON.parse(raw) as ProfileCachePayload;
        if (!parsed?.cachedAt || Date.now() - parsed.cachedAt > PROFILE_CACHE_TTL_MS) {
          return false;
        }

        setDisplayName(parsed.displayName || "Captain AeroFocus");
        setPilotTag(parsed.pilotTag || "VANGUARD-01");
        setSessions(Array.isArray(parsed.sessions) ? parsed.sessions : []);
        setFlights(Array.isArray(parsed.flights) ? parsed.flights : []);
        setIsLoading(false);
        return true;
      } catch {
        return false;
      }
    };

    const writeCache = (payload: Omit<ProfileCachePayload, "cachedAt">) => {
      try {
        window.localStorage.setItem(
          PROFILE_CACHE_KEY,
          JSON.stringify({
            ...payload,
            cachedAt: Date.now()
          })
        );
      } catch {
        // no-op: localStorage might be unavailable
      }
    };

    const hasCachedData = applyCacheIfAvailable();

    const loadProfile = async () => {
      if (!hasCachedData) {
        setIsLoading(true);
      }
      setErrorMessage(null);

      const [userResult, sessionsResult, flightsResult] = await Promise.all([
        supabase.auth.getUser(),
        supabase
          .from("sessions_log")
          .select("id, actual_duration, distractions_blocked_count, flight:flight_id(origin, destination, start_time, status)")
          .order("id", { ascending: false })
          .limit(24),
        supabase
          .from("flights")
          .select("id, status, start_time")
          .order("start_time", { ascending: false })
          .limit(120)
      ]);

      if (sessionsResult.error || flightsResult.error) {
        if (!hasCachedData) {
          setErrorMessage(sessionsResult.error?.message ?? flightsResult.error?.message ?? "Failed to load profile");
          setSessions([]);
          setFlights([]);
          setIsLoading(false);
        }
        return;
      }

      const user = userResult.data.user;
      const profileRecord = await getUserProfile();
      const metadataName = typeof user?.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null;
      const emailHandle = typeof user?.email === "string" ? user.email.split("@")[0] : null;
      const resolvedDisplayName = profileRecord?.display_name?.trim() || metadataName || emailHandle || "Captain AeroFocus";
      setDisplayName(resolvedDisplayName);
      setNameInput(resolvedDisplayName);

      const tagSource = user?.id ? user.id.slice(0, 6).toUpperCase() : "01";
      const resolvedPilotTag = `VANGUARD-${tagSource}`;
      setPilotTag(resolvedPilotTag);

      const normalizedSessions = ((sessionsResult.data as SessionRowRaw[] | null) ?? []).map((row) => {
        const joinedFlight = Array.isArray(row.flight) ? row.flight[0] ?? null : row.flight;

        return {
          id: row.id,
          actual_duration: row.actual_duration,
          distractions_blocked_count: row.distractions_blocked_count,
          flight: joinedFlight
        };
      });

      const normalizedFlights = (flightsResult.data as FlightRow[] | null) ?? [];

      setSessions(normalizedSessions);
      setFlights(normalizedFlights);

      writeCache({
        displayName: resolvedDisplayName,
        pilotTag: resolvedPilotTag,
        sessions: normalizedSessions,
        flights: normalizedFlights
      });

      setIsLoading(false);
    };

    void loadProfile();
  }, []);

  const metrics = useMemo(() => {
    const totalFocusMinutes = sessions.reduce((sum, row) => sum + (row.actual_duration ?? 0), 0);
    const successfulLandings = flights.filter((flight) => flight.status === "completed").length;
    const abortedMissions = flights.filter((flight) => flight.status === "aborted").length;
    const totalDistractions = sessions.reduce((sum, row) => sum + (row.distractions_blocked_count ?? 0), 0);

    const totalSessionCount = Math.max(sessions.length, 1);
    const distractionsPerSession = totalDistractions / totalSessionCount;
    const distractionShield = Math.max(0, Math.min(100, 100 - distractionsPerSession * 7));

    const dates = sessions
      .map((row) => row.flight?.start_time?.slice(0, 10) ?? null)
      .filter((value): value is string => Boolean(value));

    const streakDays = computeDayStreak(dates);

    return {
      totalFocusMinutes,
      successfulLandings,
      abortedMissions,
      distractionShield,
      streakDays
    };
  }, [flights, sessions]);

  const milestones = useMemo(() => {
    return sessions.slice(0, 3).map((row) => {
      const route = row.flight ? `${row.flight.origin} -> ${row.flight.destination}` : "UNKNOWN ROUTE";
      const duration = row.actual_duration ?? 0;
      const distractions = row.distractions_blocked_count ?? 0;

      return {
        id: row.id,
        date: formatDateShort(row.flight?.start_time ?? null),
        title: `${route} Focus Session`,
        detail: `${duration} minutes logged with ${distractions} distractions blocked.`
      };
    });
  }, [sessions]);

  const handleSaveName = async () => {
    const normalized = nameInput.trim();
    if (!normalized) {
      setErrorMessage("Profile name cannot be empty");
      return;
    }

    setIsSavingName(true);
    setErrorMessage(null);

    try {
      await saveDisplayName(normalized);
      setDisplayName(normalized);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to save profile name");
    } finally {
      setIsSavingName(false);
    }
  };

  return (
    <div className="bg-surface-dim text-on-background min-h-screen overflow-x-hidden">
      <main className="max-w-6xl mx-auto px-8 md:px-16 py-12 md:py-20">
        <header className="mb-16">
          <div className="font-label text-[10px] tracking-[0.3em] text-secondary mb-4 uppercase">Official Registry // 001</div>
          <h1 className="font-headline font-light text-5xl md:text-7xl tracking-tight text-primary leading-none mb-3">{displayName}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={nameInput}
              onChange={(event) => setNameInput(event.target.value)}
              className="bg-surface-container-low border border-outline-variant/30 px-3 py-2 text-sm font-mono tracking-wide text-on-surface min-w-[220px]"
              placeholder="Enter profile name"
            />
            <button
              type="button"
              onClick={() => void handleSaveName()}
              disabled={isSavingName}
              className="px-4 py-2 border border-primary/40 text-primary font-mono text-xs tracking-[0.12em] uppercase hover:bg-primary/10 disabled:opacity-60"
            >
              {isSavingName ? "Saving" : "Save Name"}
            </button>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs tracking-widest text-secondary-dim">
            <span className="bg-primary/10 px-2 py-1 border border-primary/20 text-primary">{pilotTag}</span>
            <span className="h-1 w-1 bg-outline-variant rounded-full"></span>
            <span>Focus Pilot Profile</span>
          </div>
          {errorMessage ? <p className="mt-4 text-error font-mono text-xs">{errorMessage}</p> : null}
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-20">
          <section className="md:col-span-8 bg-surface-container-low border border-outline-variant/10 p-10 min-h-[280px] flex flex-col justify-between">
            <div>
              <div className="font-label text-[10px] tracking-[0.2em] text-secondary mb-8 uppercase">Operational Continuity</div>
              <h2 className="font-mono text-4xl md:text-6xl text-primary-dim tracking-tighter">{metrics.streakDays} DAYS EN ROUTE</h2>
              <p className="mt-4 font-mono text-[11px] text-secondary">Consecutive focus-session days from your most recent activity.</p>
            </div>
            <div className="flex items-center gap-1 mt-8">
              {Array.from({ length: 12 }).map((_, index) => {
                const active = index < Math.min(metrics.streakDays, 12);
                return (
                  <div
                    key={index}
                    className={`h-1 ${index % 2 === 0 ? "w-10" : "w-6"} ${active ? "bg-primary" : "bg-outline-variant/30"}`}
                  ></div>
                );
              })}
            </div>
          </section>

          <section className="md:col-span-4 bg-surface-container-high border border-outline-variant/10 p-10 flex flex-col justify-between">
            <div>
              <div className="font-label text-[10px] tracking-[0.2em] text-secondary mb-1 uppercase">Distraction Shield</div>
              <div className="font-mono text-5xl text-primary mt-4">{metrics.distractionShield.toFixed(1)}<span className="text-xl text-secondary opacity-60">%</span></div>
            </div>
            <p className="font-mono text-[10px] leading-relaxed text-secondary opacity-70 uppercase tracking-tighter">
              Efficiency score derived from distractions blocked across completed sessions.
            </p>
          </section>

          <section className="md:col-span-4 bg-surface-container-low border border-outline-variant/10 p-8">
            <div className="font-label text-[10px] tracking-[0.2em] text-secondary mb-4 uppercase">Total Flight Time</div>
            <div className="font-mono text-3xl text-primary-dim">{formatMinutesAsHours(metrics.totalFocusMinutes)}</div>
          </section>

          <section className="md:col-span-4 bg-surface-container-low border border-outline-variant/10 p-8">
            <div className="font-label text-[10px] tracking-[0.2em] text-secondary mb-4 uppercase">Successful Landings</div>
            <div className="font-mono text-3xl text-primary-dim">{metrics.successfulLandings}</div>
          </section>

          <section className="md:col-span-4 bg-surface-container-low border border-outline-variant/10 p-8">
            <div className="font-label text-[10px] tracking-[0.2em] text-secondary mb-4 uppercase">Aborted Missions</div>
            <div className="font-mono text-3xl text-error-dim">{metrics.abortedMissions}</div>
          </section>
        </div>

        <section>
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-outline-variant/20">
            <h3 className="font-label text-[10px] tracking-[0.3em] text-secondary uppercase">Flight Log Archive // Recent Milestones</h3>
            <span className="font-mono text-[10px] text-secondary opacity-40">LIVE TELEMETRY</span>
          </div>

          {isLoading ? (
            <p className="font-mono text-xs text-secondary">Loading profile telemetry...</p>
          ) : milestones.length === 0 ? (
            <p className="font-mono text-xs text-secondary">No milestones yet. Complete sessions to populate this archive.</p>
          ) : (
            <div className="flex flex-col">
              {milestones.map((milestone) => (
                <div key={milestone.id} className="group flex flex-col md:flex-row md:items-center py-6 border-b border-outline-variant/10 hover:bg-white/[0.02] transition-colors px-4 -mx-4">
                  <div className="font-mono text-xs text-secondary-dim w-32 mb-2 md:mb-0">{milestone.date}</div>
                  <div className="flex-1">
                    <div className="font-headline font-light text-lg text-primary tracking-tight">{milestone.title}</div>
                    <div className="font-mono text-[10px] text-secondary uppercase tracking-tighter mt-1">{milestone.detail}</div>
                  </div>
                  <div className="mt-4 md:mt-0 text-primary/40 group-hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-lg">verified</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
