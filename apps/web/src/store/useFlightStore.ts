import { create } from "zustand";

import { supabase } from "@/lib/supabase";
import {
  completeFlight,
  createFlight,
  getActiveFlight
} from "@/services/flightService";
import type { Flight, FlightConfig } from "@/types";

interface FlightStore {
  currentFlight: Flight | null;
  isActive: boolean;
  blockedSites: string[];
  aircraftType: string | null;
  distanceKm: number | null;
  startFlight: (config: FlightConfig) => Promise<Flight>;
  endFlight: (status: "completed" | "aborted") => Promise<void>;
  syncWithBackend: (userId?: string) => Promise<void>;
  reset: () => void;
}

export const useFlightStore = create<FlightStore>((set, get) => ({
  currentFlight: null,
  isActive: false,
  blockedSites: [],
  aircraftType: null,
  distanceKm: null,
  startFlight: async (config: FlightConfig): Promise<Flight> => {
    const activeFlight = await getActiveFlight();
    if (activeFlight) {
      throw new Error(`ACTIVE_FLIGHT_EXISTS:${activeFlight.id}`);
    }

    const flight = await createFlight(config);
    set({
      currentFlight: flight,
      isActive: true,
      blockedSites: config.blockedSites,
      aircraftType: config.aircraftType ?? null,
      distanceKm: config.distanceKm ?? null
    });
    return flight;
  },
  endFlight: async (status: "completed" | "aborted"): Promise<void> => {
    const currentFlight = get().currentFlight;
    if (!currentFlight) {
      return;
    }

    await completeFlight(currentFlight.id, status);

    set({
      currentFlight: null,
      isActive: false,
      blockedSites: [],
      aircraftType: null,
      distanceKm: null
    });
  },
  syncWithBackend: async (_userId?: string): Promise<void> => {
    const activeFlight = await getActiveFlight();
    if (!activeFlight) {
      set({
        currentFlight: null,
        isActive: false,
        blockedSites: [],
        aircraftType: null,
        distanceKm: null
      });
      return;
    }

    const { data: blockedRows, error: blockedRowsError } = await supabase
      .from("blocked_sites")
      .select("domain")
      .eq("flight_id", activeFlight.id);

    if (blockedRowsError) {
      throw new Error(`Failed to sync blocked sites: ${blockedRowsError.message}`);
    }

    set({
      currentFlight: activeFlight,
      isActive: true,
      blockedSites: (blockedRows ?? []).map((row: { domain: string }) => row.domain),
      aircraftType: get().aircraftType,
      distanceKm: get().distanceKm
    });
  },
  reset: () => {
    set({
      currentFlight: null,
      isActive: false,
      blockedSites: [],
      aircraftType: null,
      distanceKm: null
    });
  }
}));
