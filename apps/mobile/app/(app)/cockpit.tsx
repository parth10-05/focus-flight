import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";

import Button from "../../components/ui/Button";
import { useActiveFlightSync } from "../../hooks/useActiveFlightSync";
import { useSession } from "../../lib/sessionContext";
import { useFlightStore } from "../../store/useFlightStore";

export default function CockpitScreen(): JSX.Element {
  const router = useRouter();
  const { session } = useSession();

  const { activeFlight, joinFromAnotherDevice } = useActiveFlightSync(session?.user?.id);
  const setFlight = useFlightStore((state) => state.setFlight);

  useEffect(() => {
    if (!activeFlight) {
      return;
    }

    setFlight(activeFlight);
  }, [activeFlight, setFlight]);

  return (
    <View className="flex-1 items-center justify-center bg-zinc-950 px-6">
      <View className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <Text className="text-3xl font-semibold text-sky-400">Ready for takeoff</Text>
        <Text className="mt-3 text-base leading-6 text-zinc-300">
          No active mission detected. Configure your next focus flight and launch into deep work.
        </Text>

        {activeFlight ? (
          <View className="mt-5 rounded-xl border border-sky-700/40 bg-sky-900/30 p-4">
            <Text className="text-sm font-semibold text-sky-300">Mission in progress on another device</Text>
            <View className="mt-3">
              <Button label="Join Mission" onPress={joinFromAnotherDevice} variant="ghost" />
            </View>
          </View>
        ) : null}

        <View className="mt-6">
          <Button
            label="Start Mission"
            onPress={() => router.push("/(app)/preflight")}
            variant="primary"
          />
        </View>
      </View>
    </View>
  );
}
