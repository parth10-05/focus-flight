import { Text, View } from "react-native";

import type { Flight } from "../lib/flightService";

export type SessionLog = {
  actual_duration: number | null;
  distractions_blocked_count: number | null;
};

type FlightRowProps = {
  flight: Flight & { sessions_log?: SessionLog | SessionLog[] | null };
};

function formatDate(value: string | null): string {
  if (!value) {
    return "--";
  }

  return new Date(value).toLocaleString();
}

function formatMinutes(value: number): string {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function resolveSessionLog(
  input: SessionLog | SessionLog[] | null | undefined
): SessionLog | null {
  if (!input) {
    return null;
  }

  if (Array.isArray(input)) {
    return input[0] ?? null;
  }

  return input;
}

export default function FlightRow({ flight }: FlightRowProps): JSX.Element {
  const session = resolveSessionLog(flight.sessions_log);
  const actualMinutes = session?.actual_duration ?? null;
  const plannedMinutes = Math.max(0, Math.floor((flight.duration ?? 0) / 60));
  const shownMinutes = actualMinutes ?? plannedMinutes;
  const distractions = session?.distractions_blocked_count ?? 0;
  const isCompleted = flight.status === "completed";

  return (
    <View className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-base font-semibold text-zinc-100">{flight.origin} → {flight.destination}</Text>
          <Text className="mt-1 text-xs text-zinc-500">{formatDate(flight.start_time)}</Text>
        </View>
        <View className={`rounded-full px-2.5 py-1 ${isCompleted ? "bg-emerald-900/40" : "bg-red-900/40"}`}>
          <Text className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${isCompleted ? "text-emerald-300" : "text-red-300"}`}>
            {isCompleted ? "Completed" : "Aborted"}
          </Text>
        </View>
      </View>

      <View className="mt-3 flex-row items-center justify-between">
        <View>
          <Text className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Duration</Text>
          <Text className="mt-1 text-sm font-semibold text-zinc-200">{formatMinutes(shownMinutes)}</Text>
        </View>
        <View>
          <Text className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Distractions</Text>
          <Text className="mt-1 text-sm font-semibold text-zinc-200">{distractions}</Text>
        </View>
      </View>
    </View>
  );
}
