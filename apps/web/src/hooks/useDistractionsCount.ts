import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

export function useDistractionsCount(flightId: string | null): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!flightId) {
      setCount(0);
      return;
    }

    let mounted = true;

    const loadCount = async () => {
      const { data, error } = await supabase
        .from("sessions_log")
        .select("distractions_blocked_count")
        .eq("flight_id", flightId);

      if (error) {
        console.error("Failed to read distractions count", error.message);
        return;
      }

      if (!mounted) {
        return;
      }

      const latest = (data ?? []).reduce((max, row) => Math.max(max, row.distractions_blocked_count ?? 0), 0);
      setCount(latest);
    };

    void loadCount();

    const channel = supabase
      .channel(`distractions-${flightId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sessions_log",
          filter: `flight_id=eq.${flightId}`
        },
        (payload) => {
          const nextCount = (payload.new as { distractions_blocked_count?: number } | null)?.distractions_blocked_count;
          if (typeof nextCount === "number") {
            setCount(nextCount);
          } else {
            void loadCount();
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      void supabase.removeChannel(channel);
    };
  }, [flightId]);

  return count;
}
