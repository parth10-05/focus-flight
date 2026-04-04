export interface PresetRoute {
  id: string;
  origin: string;
  originCity: string;
  destination: string;
  destinationCity: string;
  durationMinutes: number;
  distanceKm: number;
  region: "intercontinental" | "transpacific" | "transatlantic" | "asia" | "europe" | "domestic";
  aircraft: string;
}

export const PRESET_ROUTES: PresetRoute[] = [
  { id: "SIN-JFK", origin: "SIN", originCity: "Singapore", destination: "JFK", destinationCity: "New York", durationMinutes: 1060, distanceKm: 15349, region: "intercontinental", aircraft: "A350-900ULR" },
  { id: "SYD-DFW", origin: "SYD", originCity: "Sydney", destination: "DFW", destinationCity: "Dallas", durationMinutes: 990, distanceKm: 13804, region: "transpacific", aircraft: "B787-9" },
  { id: "AKL-DXB", origin: "AKL", originCity: "Auckland", destination: "DXB", destinationCity: "Dubai", durationMinutes: 1050, distanceKm: 14202, region: "intercontinental", aircraft: "B777-200LR" },
  { id: "LAX-SIN", origin: "LAX", originCity: "Los Angeles", destination: "SIN", destinationCity: "Singapore", durationMinutes: 1020, distanceKm: 14114, region: "transpacific", aircraft: "A350-900" },
  { id: "JFK-SYD", origin: "JFK", originCity: "New York", destination: "SYD", destinationCity: "Sydney", durationMinutes: 1080, distanceKm: 16014, region: "transpacific", aircraft: "B787-9" },
  { id: "LHR-PER", origin: "LHR", originCity: "London", destination: "PER", destinationCity: "Perth", durationMinutes: 1020, distanceKm: 14498, region: "intercontinental", aircraft: "B787-9" },

  { id: "JFK-DXB", origin: "JFK", originCity: "New York", destination: "DXB", destinationCity: "Dubai", durationMinutes: 780, distanceKm: 11021, region: "transatlantic", aircraft: "B777-300ER" },
  { id: "LHR-NRT", origin: "LHR", originCity: "London", destination: "NRT", destinationCity: "Tokyo", durationMinutes: 720, distanceKm: 9558, region: "intercontinental", aircraft: "B787-9" },
  { id: "LAX-LHR", origin: "LAX", originCity: "Los Angeles", destination: "LHR", destinationCity: "London", durationMinutes: 660, distanceKm: 8749, region: "transatlantic", aircraft: "B777-200ER" },
  { id: "SYD-LAX", origin: "SYD", originCity: "Sydney", destination: "LAX", destinationCity: "Los Angeles", durationMinutes: 810, distanceKm: 12074, region: "transpacific", aircraft: "B777-300ER" },
  { id: "DXB-LAX", origin: "DXB", originCity: "Dubai", destination: "LAX", destinationCity: "Los Angeles", durationMinutes: 840, distanceKm: 13420, region: "intercontinental", aircraft: "A380-800" },
  { id: "JFK-NRT", origin: "JFK", originCity: "New York", destination: "NRT", destinationCity: "Tokyo", durationMinutes: 810, distanceKm: 10835, region: "transpacific", aircraft: "B777-300ER" },
  { id: "ORD-PEK", origin: "ORD", originCity: "Chicago", destination: "PEK", destinationCity: "Beijing", durationMinutes: 780, distanceKm: 10135, region: "transpacific", aircraft: "B787-8" },
  { id: "GRU-LHR", origin: "GRU", originCity: "Sao Paulo", destination: "LHR", destinationCity: "London", durationMinutes: 690, distanceKm: 9452, region: "transatlantic", aircraft: "B777-200ER" },
  { id: "JNB-JFK", origin: "JNB", originCity: "Johannesburg", destination: "JFK", destinationCity: "New York", durationMinutes: 840, distanceKm: 12825, region: "intercontinental", aircraft: "A340-600" },
  { id: "SIN-LHR", origin: "SIN", originCity: "Singapore", destination: "LHR", destinationCity: "London", durationMinutes: 780, distanceKm: 10841, region: "intercontinental", aircraft: "A380-800" },
  { id: "BOM-JFK", origin: "BOM", originCity: "Mumbai", destination: "JFK", destinationCity: "New York", durationMinutes: 870, distanceKm: 12556, region: "intercontinental", aircraft: "B777-200LR" },
  { id: "MEX-NRT", origin: "MEX", originCity: "Mexico City", destination: "NRT", destinationCity: "Tokyo", durationMinutes: 780, distanceKm: 11315, region: "transpacific", aircraft: "B787-8" },

  { id: "LHR-JFK", origin: "LHR", originCity: "London", destination: "JFK", destinationCity: "New York", durationMinutes: 450, distanceKm: 5541, region: "transatlantic", aircraft: "B747-400" },
  { id: "CDG-NRT", origin: "CDG", originCity: "Paris", destination: "NRT", destinationCity: "Tokyo", durationMinutes: 720, distanceKm: 9717, region: "intercontinental", aircraft: "B777-300ER" },
  { id: "DXB-LHR", origin: "DXB", originCity: "Dubai", destination: "LHR", destinationCity: "London", durationMinutes: 420, distanceKm: 5484, region: "intercontinental", aircraft: "A380-800" },
  { id: "SIN-NRT", origin: "SIN", originCity: "Singapore", destination: "NRT", destinationCity: "Tokyo", durationMinutes: 390, distanceKm: 5321, region: "asia", aircraft: "B787-9" },
  { id: "AMS-JFK", origin: "AMS", originCity: "Amsterdam", destination: "JFK", destinationCity: "New York", durationMinutes: 510, distanceKm: 5857, region: "transatlantic", aircraft: "B777-200ER" },
  { id: "BKK-LHR", origin: "BKK", originCity: "Bangkok", destination: "LHR", destinationCity: "London", durationMinutes: 660, distanceKm: 9542, region: "intercontinental", aircraft: "B777-300ER" },
  { id: "ICN-LAX", origin: "ICN", originCity: "Seoul", destination: "LAX", destinationCity: "Los Angeles", durationMinutes: 660, distanceKm: 9607, region: "transpacific", aircraft: "A380-800" },
  { id: "DEL-LHR", origin: "DEL", originCity: "Delhi", destination: "LHR", destinationCity: "London", durationMinutes: 510, distanceKm: 6719, region: "intercontinental", aircraft: "B787-8" },
  { id: "NRT-SYD", origin: "NRT", originCity: "Tokyo", destination: "SYD", destinationCity: "Sydney", durationMinutes: 570, distanceKm: 7823, region: "transpacific", aircraft: "B777-200ER" },
  { id: "CPT-LHR", origin: "CPT", originCity: "Cape Town", destination: "LHR", destinationCity: "London", durationMinutes: 660, distanceKm: 9678, region: "intercontinental", aircraft: "B787-9" },
  { id: "GRU-JFK", origin: "GRU", originCity: "Sao Paulo", destination: "JFK", destinationCity: "New York", durationMinutes: 630, distanceKm: 7689, region: "transatlantic", aircraft: "B777-300ER" },
  { id: "YYZ-LHR", origin: "YYZ", originCity: "Toronto", destination: "LHR", destinationCity: "London", durationMinutes: 480, distanceKm: 5713, region: "transatlantic", aircraft: "B787-9" },
  { id: "LAX-ICN", origin: "LAX", originCity: "Los Angeles", destination: "ICN", destinationCity: "Seoul", durationMinutes: 630, distanceKm: 9607, region: "transpacific", aircraft: "B777-300ER" },
  { id: "DXB-BOM", origin: "DXB", originCity: "Dubai", destination: "BOM", destinationCity: "Mumbai", durationMinutes: 195, distanceKm: 1929, region: "intercontinental", aircraft: "A380-800" },
  { id: "HKG-LHR", origin: "HKG", originCity: "Hong Kong", destination: "LHR", destinationCity: "London", durationMinutes: 720, distanceKm: 9640, region: "intercontinental", aircraft: "B777-300ER" },
  { id: "IAH-FRA", origin: "IAH", originCity: "Houston", destination: "FRA", destinationCity: "Frankfurt", durationMinutes: 570, distanceKm: 8014, region: "transatlantic", aircraft: "B767-400ER" },

  { id: "LHR-CDG", origin: "LHR", originCity: "London", destination: "CDG", destinationCity: "Paris", durationMinutes: 80, distanceKm: 341, region: "europe", aircraft: "A320" },
  { id: "FRA-MAD", origin: "FRA", originCity: "Frankfurt", destination: "MAD", destinationCity: "Madrid", durationMinutes: 165, distanceKm: 1873, region: "europe", aircraft: "A321" },
  { id: "SIN-BKK", origin: "SIN", originCity: "Singapore", destination: "BKK", destinationCity: "Bangkok", durationMinutes: 150, distanceKm: 1430, region: "asia", aircraft: "A330-300" },
  { id: "NRT-ICN", origin: "NRT", originCity: "Tokyo", destination: "ICN", destinationCity: "Seoul", durationMinutes: 135, distanceKm: 1159, region: "asia", aircraft: "B777-200ER" },
  { id: "DXB-DOH", origin: "DXB", originCity: "Dubai", destination: "DOH", destinationCity: "Doha", durationMinutes: 75, distanceKm: 349, region: "intercontinental", aircraft: "A320" },
  { id: "BOM-DEL", origin: "BOM", originCity: "Mumbai", destination: "DEL", destinationCity: "Delhi", durationMinutes: 120, distanceKm: 1148, region: "asia", aircraft: "B737-800" },
  { id: "LAX-SFO", origin: "LAX", originCity: "Los Angeles", destination: "SFO", destinationCity: "San Francisco", durationMinutes: 65, distanceKm: 559, region: "domestic", aircraft: "B737-800" },
  { id: "JFK-ORD", origin: "JFK", originCity: "New York", destination: "ORD", destinationCity: "Chicago", durationMinutes: 145, distanceKm: 1189, region: "domestic", aircraft: "B737-900" },
  { id: "SYD-MEL", origin: "SYD", originCity: "Sydney", destination: "MEL", destinationCity: "Melbourne", durationMinutes: 85, distanceKm: 713, region: "domestic", aircraft: "A330-200" },
  { id: "BCN-FCO", origin: "BCN", originCity: "Barcelona", destination: "FCO", destinationCity: "Rome", durationMinutes: 130, distanceKm: 1360, region: "europe", aircraft: "A320neo" },
  { id: "AMS-FCO", origin: "AMS", originCity: "Amsterdam", destination: "FCO", destinationCity: "Rome", durationMinutes: 155, distanceKm: 1654, region: "europe", aircraft: "B737-800" },
  { id: "HKG-PVG", origin: "HKG", originCity: "Hong Kong", destination: "PVG", destinationCity: "Shanghai", durationMinutes: 135, distanceKm: 1256, region: "asia", aircraft: "A330-300" },
  { id: "SFO-SEA", origin: "SFO", originCity: "San Francisco", destination: "SEA", destinationCity: "Seattle", durationMinutes: 130, distanceKm: 1093, region: "domestic", aircraft: "A320neo" },
  { id: "MUC-LHR", origin: "MUC", originCity: "Munich", destination: "LHR", destinationCity: "London", durationMinutes: 120, distanceKm: 918, region: "europe", aircraft: "A320" },
  { id: "HND-CTS", origin: "HND", originCity: "Tokyo", destination: "CTS", destinationCity: "Sapporo", durationMinutes: 95, distanceKm: 822, region: "asia", aircraft: "B737-800" },
  { id: "BOS-JFK", origin: "BOS", originCity: "Boston", destination: "JFK", destinationCity: "New York", durationMinutes: 75, distanceKm: 300, region: "domestic", aircraft: "A220-300" },

  // India domestic sectors
  { id: "DEL-BLR", origin: "DEL", originCity: "Delhi", destination: "BLR", destinationCity: "Bengaluru", durationMinutes: 170, distanceKm: 1701, region: "domestic", aircraft: "A320neo" },
  { id: "BLR-DEL", origin: "BLR", originCity: "Bengaluru", destination: "DEL", destinationCity: "Delhi", durationMinutes: 170, distanceKm: 1701, region: "domestic", aircraft: "A320neo" },
  { id: "BOM-BLR", origin: "BOM", originCity: "Mumbai", destination: "BLR", destinationCity: "Bengaluru", durationMinutes: 105, distanceKm: 842, region: "domestic", aircraft: "B737-800" },
  { id: "BLR-BOM", origin: "BLR", originCity: "Bengaluru", destination: "BOM", destinationCity: "Mumbai", durationMinutes: 105, distanceKm: 842, region: "domestic", aircraft: "B737-800" },
  { id: "DEL-HYD", origin: "DEL", originCity: "Delhi", destination: "HYD", destinationCity: "Hyderabad", durationMinutes: 130, distanceKm: 1253, region: "domestic", aircraft: "A321neo" },
  { id: "HYD-DEL", origin: "HYD", originCity: "Hyderabad", destination: "DEL", destinationCity: "Delhi", durationMinutes: 130, distanceKm: 1253, region: "domestic", aircraft: "A321neo" },
  { id: "MAA-BOM", origin: "MAA", originCity: "Chennai", destination: "BOM", destinationCity: "Mumbai", durationMinutes: 125, distanceKm: 1033, region: "domestic", aircraft: "A320" },
  { id: "BOM-MAA", origin: "BOM", originCity: "Mumbai", destination: "MAA", destinationCity: "Chennai", durationMinutes: 125, distanceKm: 1033, region: "domestic", aircraft: "A320" },
  { id: "CCU-DEL", origin: "CCU", originCity: "Kolkata", destination: "DEL", destinationCity: "Delhi", durationMinutes: 145, distanceKm: 1305, region: "domestic", aircraft: "A320neo" },
  { id: "DEL-CCU", origin: "DEL", originCity: "Delhi", destination: "CCU", destinationCity: "Kolkata", durationMinutes: 145, distanceKm: 1305, region: "domestic", aircraft: "A320neo" }
];

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}H 00M` : `${h}H ${String(m).padStart(2, "0")}M`;
}

export const REGIONS = [
  { id: "all", label: "ALL ROUTES" },
  { id: "intercontinental", label: "INTERCONTINENTAL" },
  { id: "transpacific", label: "TRANSPACIFIC" },
  { id: "transatlantic", label: "TRANSATLANTIC" },
  { id: "asia", label: "ASIA" },
  { id: "europe", label: "EUROPE" },
  { id: "domestic", label: "DOMESTIC" }
] as const;

export const DURATION_FILTERS = [
  { id: "all", label: "ALL TIMES" },
  { id: "short", label: "SHORT <=3H" },
  { id: "medium", label: "MEDIUM 3-8H" },
  { id: "long", label: "LONG 8-13H" },
  { id: "ultra", label: "ULTRA 13H+" }
] as const;

export type DurationFilterId = (typeof DURATION_FILTERS)[number]["id"];
