import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";

import Button from "../../components/ui/Button";
import { supabase } from "../../lib/supabase";

type SessionLog = {
  actual_duration: number | null;
  distractions_blocked_count: number | null;
};

type DebriefFlight = {
  id: string;
  origin: string;
  destination: string;
  duration: number;
  status: "planned" | "active" | "completed" | "aborted";
  sessions_log?: SessionLog[] | SessionLog | null;
};

function formatMinutes(value: number): string {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function pickSession(logs: DebriefFlight["sessions_log"]): SessionLog | null {
  if (!logs) {
    return null;
  }

  if (Array.isArray(logs)) {
    return logs[0] ?? null;
  }

  return logs;
}

export default function DebriefScreen(): JSX.Element {
  const router = useRouter();
  const params = useLocalSearchParams<{ flightId?: string }>();
  const flightId = params.flightId;

  const [flight, setFlight] = useState<DebriefFlight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!flightId) {
      setLoading(false);
      setError("Missing flight id");
      return;
    }

    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      const { data, error: queryError } = await supabase
        .from("flights")
        .select("id, origin, destination, duration, status, sessions_log(actual_duration, distractions_blocked_count)")
        .eq("id", flightId)
        .maybeSingle();

      if (!mounted) {
        return;
      }

      if (queryError) {
        setError(queryError.message);
        setLoading(false);
        return;
      }

      setFlight((data as DebriefFlight | null) ?? null);
      setLoading(false);
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [flightId]);

  const session = useMemo(() => pickSession(flight?.sessions_log), [flight?.sessions_log]);

  const plannedMinutes = Math.max(0, Math.floor((flight?.duration ?? 0) / 60));
  const actualMinutes = session?.actual_duration ?? 0;
  const distractions = session?.distractions_blocked_count ?? 0;
  const isCompleted = flight?.status === "completed";

  if (loading) {
    return <View className="flex-1 bg-zinc-950" />;
  }

  return (
    <View className="flex-1 justify-center bg-zinc-950 px-6">
      <View className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <Text className="text-xs uppercase tracking-[0.25em] text-zinc-500">Mission Debrief</Text>
        <Text className="mt-3 text-3xl font-semibold text-sky-300">
          {flight ? `${flight.origin} → ${flight.destination}` : "Unknown mission"}
        </Text>

        {error ? <Text className="mt-4 text-sm text-red-400">{error}</Text> : null}

        <View className="mt-6 gap-4 rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
          <View className="flex-row justify-between">
            <Text className="text-sm text-zinc-400">Planned Duration</Text>
            <Text className="text-sm font-semibold text-zinc-100">{formatMinutes(plannedMinutes)}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-sm text-zinc-400">Actual Duration</Text>
            <Text className="text-sm font-semibold text-zinc-100">{formatMinutes(actualMinutes)}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-sm text-zinc-400">Distractions Blocked</Text>
            <Text className="text-sm font-semibold text-zinc-100">{distractions}</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-sm text-zinc-400">Completion Status</Text>
            <View className={`rounded-full px-2.5 py-1 ${isCompleted ? "bg-emerald-900/40" : "bg-red-900/40"}`}>
              <Text className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${isCompleted ? "text-emerald-300" : "text-red-300"}`}>
                {isCompleted ? "Completed" : "Aborted"}
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-6">
          <Button label="Return to Base" onPress={() => router.replace("/(app)/cockpit")} variant="primary" />
        </View>
      </View>
    </View>
  );
}
