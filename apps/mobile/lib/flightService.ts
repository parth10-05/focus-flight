import { supabase } from "./supabase";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export type FlightStatus = "planned" | "active" | "completed" | "aborted";

export type Flight = {
  id: string;
  origin: string;
  destination: string;
  duration: number;
  start_time: string | null;
  end_time: string | null;
  status: FlightStatus;
  blocked_domains?: string[];
};

type FlightRow = Omit<Flight, "blocked_domains"> & {
  blocked_sites?: Array<{ domain: string }>;
};

function mapFlight(row: FlightRow): Flight {
  return {
    id: row.id,
    origin: row.origin,
    destination: row.destination,
    duration: row.duration,
    start_time: row.start_time,
    end_time: row.end_time,
    status: row.status,
    blocked_domains: (row.blocked_sites ?? []).map((item) => item.domain)
  };
}

type CreateFlightParams = {
  origin: string;
  destination: string;
  durationMinutes: number;
  blockedDomains: string[];
};

export async function getActiveFlight(): Promise<Flight | null> {
  const { data, error } = await supabase
    .from("flights")
    .select("*, blocked_sites(domain)")
    .eq("status", "active")
    .order("start_time", { ascending: false })
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return mapFlight(data as FlightRow);
}

export async function getFlightById(flightId: string): Promise<Flight | null> {
  const { data, error } = await supabase
    .from("flights")
    .select("*, blocked_sites(domain)")
    .eq("id", flightId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return mapFlight(data as FlightRow);
}

export async function getDistractionsCount(flightId: string): Promise<number> {
  const { data, error } = await supabase
    .from("sessions_log")
    .select("distractions_blocked_count")
    .eq("flight_id", flightId)
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Number(data?.distractions_blocked_count ?? 0);
}

export async function createFlight(params: CreateFlightParams): Promise<Flight> {
  const { data: userData } = await supabase.auth.getUser();

  const insertPayload: Record<string, unknown> = {
    origin: params.origin,
    destination: params.destination,
    duration: params.durationMinutes * 60,
    status: "active",
    start_time: new Date().toISOString()
  };

  if (userData.user?.id) {
    // Keep compatibility with environments where flights.user_id already exists.
    insertPayload.user_id = userData.user.id;
  }

  const { data: flight, error: flightError } = await supabase
    .from("flights")
    .insert(insertPayload)
    .select("*")
    .single();

  if (flightError || !flight) {
    throw new Error(flightError?.message ?? "Failed to create flight");
  }

  const { error: sessionError } = await supabase.from("sessions_log").insert({
    flight_id: flight.id,
    actual_duration: null,
    distractions_blocked_count: 0
  });

  if (sessionError) {
    throw new Error(sessionError.message);
  }

  if (params.blockedDomains.length > 0) {
    const blockedRows = params.blockedDomains.map((domain) => ({
      flight_id: flight.id,
      domain
    }));

    const { error: blockedError } = await supabase.from("blocked_sites").insert(blockedRows);

    if (blockedError) {
      throw new Error(blockedError.message);
    }
  }

  return {
    ...(flight as Flight),
    blocked_domains: params.blockedDomains
  };
}

export async function completeFlight(
  flightId: string,
  status: "completed" | "aborted" = "completed"
): Promise<void> {
  const { data: existingFlight, error: fetchError } = await supabase
    .from("flights")
    .select("id, start_time")
    .eq("id", flightId)
    .maybeSingle();

  if (fetchError || !existingFlight) {
    throw new Error(fetchError?.message ?? "Flight not found");
  }

  const startAt = existingFlight.start_time ? new Date(existingFlight.start_time).getTime() : Date.now();
  const actualDurationMinutes = Math.max(0, Math.floor((Date.now() - startAt) / 60000));

  const { error: updateFlightError } = await supabase
    .from("flights")
    .update({
      status,
      end_time: new Date().toISOString()
    })
    .eq("id", flightId);

  if (updateFlightError) {
    throw new Error(updateFlightError.message);
  }

  const { data: existingSession, error: sessionFetchError } = await supabase
    .from("sessions_log")
    .select("id")
    .eq("flight_id", flightId)
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (sessionFetchError) {
    throw new Error(sessionFetchError.message);
  }

  if (existingSession?.id) {
    const { error: updateSessionError } = await supabase
      .from("sessions_log")
      .update({ actual_duration: actualDurationMinutes })
      .eq("id", existingSession.id);

    if (updateSessionError) {
      throw new Error(updateSessionError.message);
    }
    return;
  }

  const { error: insertSessionError } = await supabase.from("sessions_log").insert({
    flight_id: flightId,
    actual_duration: actualDurationMinutes,
    distractions_blocked_count: 0
  });

  if (insertSessionError) {
    throw new Error(insertSessionError.message);
  }
}

export function subscribeToFlightById(
  flightId: string,
  callback: (flight: Flight) => void
): () => void {
  type FlightPayload = RealtimePostgresChangesPayload<Record<string, unknown>>;

  const channel = supabase
    .channel(`flight-${flightId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "flights",
        filter: `id=eq.${flightId}`
      },
      (payload: FlightPayload) => {
        callback(payload.new as Flight);
      }
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

export function subscribeToDistractions(
  flightId: string,
  callback: (count: number) => void
): () => void {
  type SessionPayload = RealtimePostgresChangesPayload<Record<string, unknown>>;

  const channel = supabase
    .channel(`distractions-${flightId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "sessions_log",
        filter: `flight_id=eq.${flightId}`
      },
      (payload: SessionPayload) => {
        callback(Number(payload.new.distractions_blocked_count ?? 0));
      }
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
