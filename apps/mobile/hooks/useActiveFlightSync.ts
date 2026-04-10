import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";

import { getActiveFlight, type Flight } from "../lib/flightService";
import { subscribeToActiveFlight, unsubscribe } from "../lib/syncService";

export function useActiveFlightSync(userId?: string): {
  activeFlight: Flight | null;
  joinFromAnotherDevice: () => void;
} {
  const router = useRouter();
  const [activeFlight, setActiveFlight] = useState<Flight | null>(null);

  useEffect(() => {
    let mounted = true;
    let channel: RealtimeChannel | null = null;

    if (!userId) {
      setActiveFlight(null);
      return;
    }

    void getActiveFlight()
      .then((flight) => {
        if (!mounted) {
          return;
        }
        setActiveFlight(flight);
      })
      .catch(() => {
        if (!mounted) {
          return;
        }
        setActiveFlight(null);
      });

    channel = subscribeToActiveFlight(userId, (flight) => {
      if (!mounted) {
        return;
      }
      setActiveFlight(flight);
    });

    return () => {
      mounted = false;
      if (channel) {
        unsubscribe(channel);
      }
    };
  }, [userId]);

  const joinFromAnotherDevice = useCallback(() => {
    if (!activeFlight?.id) {
      return;
    }

    router.push({
      pathname: "/(app)/active-flight",
      params: { flightId: activeFlight.id }
    });
  }, [activeFlight?.id, router]);

  return {
    activeFlight,
    joinFromAnotherDevice
  };
}
