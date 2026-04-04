export interface Flight {
  id: string;
  origin: string;
  destination: string;
  duration: number;
  start_time: string | null;
  end_time: string | null;
  status: "planned" | "active" | "completed" | "aborted";
}

export interface BlockedSite {
  id: string;
  flight_id: string;
  domain: string;
}

export interface SessionLog {
  id: string;
  flight_id: string;
  actual_duration: number | null;
  distractions_blocked_count: number;
}

export interface FlightConfig {
  origin: string;
  destination: string;
  duration: number;
  blockedSites: string[];
  aircraftType?: string;
  distanceKm?: number;
}
