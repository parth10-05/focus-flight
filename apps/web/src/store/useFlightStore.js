import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { completeFlight, createFlight, getActiveFlight } from "@/services/flightService";
export const useFlightStore = create((set, get) => ({
    currentFlight: null,
    isActive: false,
    blockedSites: [],
    aircraftType: null,
    distanceKm: null,
    startFlight: async (config) => {
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
    endFlight: async (status) => {
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
    syncWithBackend: async (_userId) => {
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
            blockedSites: (blockedRows ?? []).map((row) => row.domain),
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
