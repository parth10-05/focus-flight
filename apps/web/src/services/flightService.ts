import { supabase } from "@/lib/supabase";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import type { Flight, FlightConfig } from "@/types";

export async function createFlight(config: FlightConfig): Promise<Flight> {
  try {
    const existingActiveFlight = await getActiveFlight();
    if (existingActiveFlight) {
      throw new Error(`ACTIVE_FLIGHT_EXISTS:${existingActiveFlight.id}`);
    }

    const startTime = new Date().toISOString();
    const { data: flight, error: flightError } = await supabase
      .from("flights")
      .insert({
        origin: config.origin,
        destination: config.destination,
        duration: config.duration,
        status: "active",
        start_time: startTime
      })
      .select("*")
      .single();

    if (flightError || !flight) {
      throw new Error(flightError?.message ?? "Failed to create flight");
    }

    const { error: sessionLogInitError } = await supabase.from("sessions_log").insert({
      flight_id: flight.id,
      actual_duration: null,
      distractions_blocked_count: 0
    });

    if (sessionLogInitError) {
      throw new Error(`Flight created but session log init failed: ${sessionLogInitError.message}`);
    }

    if (config.blockedSites.length > 0) {
      const blockedRows = config.blockedSites.map((domain) => ({
        flight_id: flight.id,
        domain
      }));

      const { error: blockedSitesError } = await supabase
        .from("blocked_sites")
        .insert(blockedRows);

      if (blockedSitesError) {
        throw new Error(`Flight created but blocked sites failed: ${blockedSitesError.message}`);
      }
    }

    return flight as Flight;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unexpected error while creating flight");
  }
}

export async function getActiveFlight(): Promise<Flight | null> {
  try {
    const { data, error } = await supabase
      .from("flights")
      .select("*")
      .eq("status", "active")
      .order("start_time", { ascending: false })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch active flight: ${error.message}`);
    }

    return (data as Flight | null) ?? null;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unexpected error while fetching active flight");
  }
}

export async function completeFlight(flightId: string, status: "completed" | "aborted"): Promise<void> {
  try {
    const { data: existingFlight, error: fetchError } = await supabase
      .from("flights")
      .select("id, start_time")
      .eq("id", flightId)
      .single();

    if (fetchError || !existingFlight) {
      throw new Error(fetchError?.message ?? "Active flight not found");
    }

    const startAt = existingFlight.start_time ? new Date(existingFlight.start_time).getTime() : Date.now();
    const actualDurationMinutes = Math.max(0, Math.round((Date.now() - startAt) / 60000));
    const endTime = new Date().toISOString();

    const { error: updateError } = await supabase
      .from("flights")
      .update({
        status,
        end_time: endTime
      })
      .eq("id", flightId);

    if (updateError) {
      throw new Error(`Failed to complete flight: ${updateError.message}`);
    }

    const { data: existingSessionLog, error: sessionLogFetchError } = await supabase
      .from("sessions_log")
      .select("id")
      .eq("flight_id", flightId)
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (sessionLogFetchError) {
      throw new Error(`Flight updated but failed to read session log: ${sessionLogFetchError.message}`);
    }

    if (existingSessionLog?.id) {
      const { error: sessionLogUpdateError } = await supabase
        .from("sessions_log")
        .update({ actual_duration: actualDurationMinutes })
        .eq("id", existingSessionLog.id);

      if (sessionLogUpdateError) {
        throw new Error(`Flight updated but session log update failed: ${sessionLogUpdateError.message}`);
      }
      return;
    }

    const { error: sessionLogInsertError } = await supabase.from("sessions_log").insert({
      flight_id: flightId,
      actual_duration: actualDurationMinutes,
      distractions_blocked_count: 0
    });

    if (sessionLogInsertError) {
      throw new Error(`Flight updated but session log creation failed: ${sessionLogInsertError.message}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unexpected error while completing flight");
  }
}

export function subscribeToFlightChanges(callback: (flight: Flight) => void): () => void {
  type FlightRealtimePayload = RealtimePostgresChangesPayload<Record<string, unknown>>;

  const channel = supabase
    .channel("flight-changes")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "flights"
      },
      (payload: FlightRealtimePayload) => {
        callback(payload.new as Flight);
      }
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "flights"
      },
      (payload: FlightRealtimePayload) => {
        callback(payload.new as Flight);
      }
    )
    .subscribe((status: string) => {
      if (status === "CHANNEL_ERROR") {
        console.error("Supabase realtime channel error for flight changes");
      }
    });

  return () => {
    void supabase.removeChannel(channel);
  };
}
