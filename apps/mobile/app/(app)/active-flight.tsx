import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Text, View } from "react-native";

import BlockingPermissionBanner from "../../components/BlockingPermissionBanner";
import MissionTimer from "../../components/MissionTimer";
import Button from "../../components/ui/Button";
import { useCountdown } from "../../hooks/useCountdown";
import {
  activateBlocking,
  deactivateBlocking,
  ensurePermission
} from "../../lib/blockingService";
import {
  completeFlight,
  getDistractionsCount,
  getFlightById,
  subscribeToDistractions,
  subscribeToFlightById,
  type Flight
} from "../../lib/flightService";
import { cancelReminder, scheduleMissionReminder } from "../../lib/notificationService";
import { useFlightStore } from "../../store/useFlightStore";

export default function ActiveFlightScreen(): JSX.Element {
  const router = useRouter();
  const params = useLocalSearchParams<{ flightId?: string }>();
  const flightId = params.flightId;

  const [flight, setFlight] = useState<Flight | null>(null);
  const [distractions, setDistractions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<"completed" | "aborted" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPermissionWarning, setShowPermissionWarning] = useState(false);
  const completionTriggeredRef = useRef(false);
  const statusHandledRef = useRef(false);
  const reminderIdRef = useRef<string | null>(null);
  const pulse = useRef(new Animated.Value(0.4)).current;

  const setStoreFlight = useFlightStore((state) => state.setFlight);
  const clearFlight = useFlightStore((state) => state.clearFlight);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true
        }),
        Animated.timing(pulse, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true
        })
      ])
    ).start();
  }, [pulse]);

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

      try {
        const [flightData, distractionsCount] = await Promise.all([
          getFlightById(flightId),
          getDistractionsCount(flightId)
        ]);

        if (!mounted) {
          return;
        }

        if (!flightData) {
          setError("Flight not found");
          setLoading(false);
          return;
        }

        setFlight(flightData);
        setStoreFlight(flightData);
        setDistractions(distractionsCount);
      } catch (nextError) {
        if (!mounted) {
          return;
        }
        setError(nextError instanceof Error ? nextError.message : "Failed to load flight");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void load();

    const unsubscribeFlight = subscribeToFlightById(flightId, (nextFlight) => {
      if (!mounted) {
        return;
      }
      setFlight(nextFlight);
      setStoreFlight(nextFlight);
    });

    const unsubscribeDistractions = subscribeToDistractions(flightId, (count) => {
      if (!mounted) {
        return;
      }
      setDistractions(count);
    });

    return () => {
      mounted = false;
      unsubscribeFlight();
      unsubscribeDistractions();
    };
  }, [flightId, setStoreFlight]);

  const { remaining, percentComplete, isExpired } = useCountdown(
    flight?.duration ?? 0,
    flight?.start_time ?? null
  );

  const missionName = useMemo(() => {
    if (!flight) {
      return "Mission";
    }
    return `${flight.origin} → ${flight.destination}`;
  }, [flight]);

  const setupBlocking = async (domains: string[]) => {
    try {
      const granted = await ensurePermission();
      if (!granted) {
        setShowPermissionWarning(true);
        return;
      }

      setShowPermissionWarning(false);
      await activateBlocking(domains);
    } catch (blockingError) {
      setError(blockingError instanceof Error ? blockingError.message : "Failed to activate app blocking");
    }
  };

  useEffect(() => {
    if (!flight) {
      return;
    }

    void setupBlocking(flight.blocked_domains ?? []);
  }, [flight?.blocked_domains, flight?.id]);

  useEffect(() => {
    if (!flight?.id || !flight.start_time) {
      return;
    }

    const startMs = new Date(flight.start_time).getTime();
    if (Number.isNaN(startMs)) {
      return;
    }

    const endsAt = new Date(startMs + (flight.duration * 1000));

    const setupReminder = async () => {
      if (reminderIdRef.current) {
        await cancelReminder(reminderIdRef.current);
        reminderIdRef.current = null;
      }

      reminderIdRef.current = await scheduleMissionReminder(flight.id, endsAt);
    };

    void setupReminder();
  }, [flight?.duration, flight?.id, flight?.start_time]);

  useEffect(() => {
    return () => {
      if (!reminderIdRef.current) {
        return;
      }

      void cancelReminder(reminderIdRef.current);
      reminderIdRef.current = null;
    };
  }, []);

  useEffect(() => {
    statusHandledRef.current = false;
  }, [flight?.id]);

  useEffect(() => {
    if (!flight?.id || !flight.status || actionLoading || statusHandledRef.current) {
      return;
    }

    if (flight.status === "active") {
      return;
    }

    statusHandledRef.current = true;

    const handleRemoteStatus = async () => {
      await deactivateBlocking();
      if (reminderIdRef.current) {
        await cancelReminder(reminderIdRef.current);
        reminderIdRef.current = null;
      }
      clearFlight();

      if (flight.status === "aborted") {
        router.replace("/(app)/cockpit");
        return;
      }

      router.replace({
        pathname: "/(app)/debrief",
        params: { flightId: flight.id }
      });
    };

    void handleRemoteStatus();
  }, [actionLoading, clearFlight, flight?.id, flight?.status, router]);

  const runCompleteFlight = async (status: "completed" | "aborted") => {
    if (!flight?.id) {
      return;
    }

    setActionLoading(status);
    setError(null);

    try {
      await completeFlight(flight.id, status);
      await deactivateBlocking();
      if (reminderIdRef.current) {
        await cancelReminder(reminderIdRef.current);
        reminderIdRef.current = null;
      }
      clearFlight();

      if (status === "aborted") {
        router.replace("/(app)/cockpit");
        return;
      }

      router.replace({
        pathname: "/(app)/debrief",
        params: { flightId: flight.id }
      });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to update mission status");
      completionTriggeredRef.current = false;
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    if (!flight?.id || !isExpired || completionTriggeredRef.current || actionLoading) {
      return;
    }

    completionTriggeredRef.current = true;
    void runCompleteFlight("completed");
  }, [actionLoading, flight?.id, isExpired]);

  if (loading) {
    return <View className="flex-1 bg-zinc-950" />;
  }

  return (
    <View className="flex-1 bg-zinc-950 px-6 pt-14 pb-8">
      <Text className="text-sm uppercase tracking-[0.25em] text-zinc-500">Live mission HUD</Text>
      <Text className="mt-3 text-4xl font-semibold leading-tight text-sky-300">{missionName}</Text>

      <View className="mt-5 flex-row items-center gap-2 self-start rounded-full border border-sky-700/50 bg-sky-900/30 px-3 py-1.5">
        <Animated.View style={{ opacity: pulse }} className="h-2.5 w-2.5 rounded-full bg-sky-400" />
        <Text className="text-xs font-semibold tracking-[0.2em] text-sky-300">ACTIVE</Text>
      </View>

      <View className="mt-10 items-center">
        <MissionTimer percentComplete={percentComplete} remaining={remaining} size={250} />
      </View>

      <View className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <Text className="text-xs uppercase tracking-[0.2em] text-zinc-500">Distractions blocked</Text>
        <Text className="mt-2 text-5xl font-semibold text-zinc-100">{distractions}</Text>
      </View>

      <BlockingPermissionBanner
        visible={showPermissionWarning}
        onRequestPermission={() => {
          void setupBlocking(flight?.blocked_domains ?? []);
        }}
      />

      {error ? <Text className="mt-4 text-sm text-red-400">{error}</Text> : null}

      <View className="mt-auto gap-3">
        <Button
          label="Complete Mission"
          onPress={() => void runCompleteFlight("completed")}
          loading={actionLoading === "completed"}
          variant="primary"
        />
        <Button
          label="Abort Mission"
          onPress={() => void runCompleteFlight("aborted")}
          loading={actionLoading === "aborted"}
          variant="danger"
        />
      </View>
    </View>
  );
}
