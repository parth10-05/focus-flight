import { create } from "zustand";

import type { Flight } from "../lib/flightService";

type SessionStatus = "idle" | "active" | "completed" | "aborted";

type FlightStore = {
  currentFlight: Flight | null;
  blockedDomains: string[];
  sessionStatus: SessionStatus;
  setFlight: (flight: Flight) => void;
  clearFlight: () => void;
  setBlocked: (domains: string[]) => void;
};

export const useFlightStore = create<FlightStore>((set) => ({
  currentFlight: null,
  blockedDomains: [],
  sessionStatus: "idle",
  setFlight: (flight) => {
    set({
      currentFlight: flight,
      sessionStatus: flight.status === "active" ? "active" : flight.status
    });
  },
  clearFlight: () => {
    set({
      currentFlight: null,
      blockedDomains: [],
      sessionStatus: "idle"
    });
  },
  setBlocked: (domains) => {
    set({ blockedDomains: domains });
  }
}));
