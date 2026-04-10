import type { RealtimeChannel } from "@supabase/supabase-js";

import type { Flight } from "./flightService";
import { getActiveFlight } from "./flightService";
import { supabase } from "./supabase";

export function subscribeToActiveFlight(
  userId: string,
  onFlight: (flight: Flight | null) => void
): RealtimeChannel {
  // TODO(P0): Once flights.user_id exists, include user_id=eq.${userId} in the realtime filter.
  const channel = supabase
    .channel(`active-flight-${userId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "flights",
        filter: "status=eq.active"
      },
      () => {
        void getActiveFlight()
          .then((flight) => {
            onFlight(flight);
          })
          .catch(() => {
            onFlight(null);
          });
      }
    )
    .subscribe();

  return channel;
}

export function unsubscribe(channel: RealtimeChannel): void {
  void supabase.removeChannel(channel);
}
