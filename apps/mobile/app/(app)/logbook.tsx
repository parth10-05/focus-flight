import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, Text, View } from "react-native";

import FlightRow, { type SessionLog } from "../../components/FlightRow";
import type { Flight } from "../../lib/flightService";
import { supabase } from "../../lib/supabase";

const PAGE_SIZE = 20;

type LogbookFlight = Flight & {
  sessions_log?: SessionLog | SessionLog[] | null;
};

type QueryRow = {
  id: string;
  origin: string;
  destination: string;
  duration: number;
  start_time: string | null;
  end_time: string | null;
  status: "planned" | "active" | "completed" | "aborted";
  sessions_log?: SessionLog[] | SessionLog | null;
};

function normalize(rows: QueryRow[]): LogbookFlight[] {
  return rows.map((row) => {
    const session = Array.isArray(row.sessions_log) ? row.sessions_log[0] ?? null : row.sessions_log;

    return {
      id: row.id,
      origin: row.origin,
      destination: row.destination,
      duration: row.duration,
      start_time: row.start_time,
      end_time: row.end_time,
      status: row.status,
      sessions_log: session
    };
  });
}

export default function LogbookScreen(): JSX.Element {
  const [flights, setFlights] = useState<LogbookFlight[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(async (nextPage: number, reset: boolean) => {
    const from = nextPage * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error: queryError } = await supabase
      .from("flights")
      .select("id, origin, destination, duration, start_time, end_time, status, sessions_log(actual_duration, distractions_blocked_count)")
      .in("status", ["completed", "aborted"])
      .order("start_time", { ascending: false })
      .range(from, to);

    if (queryError) {
      throw new Error(queryError.message);
    }

    const normalized = normalize((data as QueryRow[] | null) ?? []);
    setFlights((current) => (reset ? normalized : [...current, ...normalized]));
    setHasMore(normalized.length === PAGE_SIZE);
    setPage(nextPage);
  }, []);

  const initialLoad = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await fetchPage(0, true);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to load logbook");
      setFlights([]);
    } finally {
      setLoading(false);
    }
  }, [fetchPage]);

  useEffect(() => {
    void initialLoad();
  }, [initialLoad]);

  const onRefresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      await fetchPage(0, true);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to refresh logbook");
    } finally {
      setRefreshing(false);
    }
  };

  const onEndReached = async () => {
    if (loadingMore || loading || refreshing || !hasMore) {
      return;
    }

    setLoadingMore(true);
    setError(null);
    try {
      await fetchPage(page + 1, false);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to load more missions");
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return <View className="flex-1 bg-zinc-950" />;
  }

  return (
    <View className="flex-1 bg-zinc-950 px-6 pt-14">
      <Text className="text-3xl font-semibold text-sky-300">Logbook</Text>
      <Text className="mt-2 text-sm text-zinc-400">Mission history ordered by launch time</Text>
      {error ? <Text className="mt-3 text-sm text-red-400">{error}</Text> : null}

      <FlatList
        className="mt-6"
        data={flights}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FlightRow flight={item} />}
        contentContainerStyle={{ gap: 10, paddingBottom: 28, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} tintColor="#38bdf8" />}
        onEndReachedThreshold={0.5}
        onEndReached={() => void onEndReached()}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center pt-24">
            <Text className="text-base text-zinc-400">No missions logged yet</Text>
          </View>
        }
        ListFooterComponent={
          loadingMore ? (
            <Text className="py-3 text-center text-sm text-zinc-500">Loading more...</Text>
          ) : null
        }
      />
    </View>
  );
}
