export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
export const TABLE = {
  FLIGHTS: 'flights',
  BLOCKED_SITES: 'blocked_sites',
  SESSIONS_LOG: 'sessions_log'
} as const;
export const FLIGHT_STATUS = {
  PLANNED: 'planned',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ABORTED: 'aborted'
} as const;
export type FlightStatus = typeof FLIGHT_STATUS[keyof typeof FLIGHT_STATUS];
