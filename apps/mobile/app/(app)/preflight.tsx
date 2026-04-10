import { useEffect, useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";

import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { createFlight } from "../../lib/flightService";
import { supabase } from "../../lib/supabase";
import { useFlightStore } from "../../store/useFlightStore";

const PRESET_DURATIONS = [25, 45, 60, 90] as const;

export default function PreflightScreen(): JSX.Element {
  const router = useRouter();

  const [origin, setOrigin] = useState("Home Base");
  const [destination, setDestination] = useState("Deep Work");
  const [selectedDuration, setSelectedDuration] = useState<number>(45);
  const [customDuration, setCustomDuration] = useState("");
  const [domainInput, setDomainInput] = useState("");
  const [domains, setDomains] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setFlight = useFlightStore((state) => state.setFlight);
  const setBlocked = useFlightStore((state) => state.setBlocked);

  useEffect(() => {
    const preloadBlockedDomains = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user?.id) {
        return;
      }

      const { data, error: profileError } = await supabase
        .from("user_profiles")
        .select("last_blocked_sites")
        .eq("user_id", userData.user.id)
        .maybeSingle();

      if (profileError) {
        return;
      }

      if (Array.isArray(data?.last_blocked_sites) && data.last_blocked_sites.length > 0) {
        setDomains(data.last_blocked_sites);
      }
    };

    void preloadBlockedDomains();
  }, []);

  const resolvedDuration = useMemo(() => {
    const customValue = Number(customDuration);

    if (!Number.isNaN(customValue) && customValue > 0) {
      return Math.floor(customValue);
    }

    return selectedDuration;
  }, [customDuration, selectedDuration]);

  const addDomain = () => {
    const nextDomain = domainInput.trim().toLowerCase();
    if (!nextDomain) {
      return;
    }

    if (domains.includes(nextDomain)) {
      setDomainInput("");
      return;
    }

    setDomains((current) => [...current, nextDomain]);
    setDomainInput("");
  };

  const removeDomain = (domainToRemove: string) => {
    setDomains((current) => current.filter((domain) => domain !== domainToRemove));
  };

  const launchMission = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!origin.trim() || !destination.trim()) {
        throw new Error("Origin and destination are required");
      }

      if (resolvedDuration <= 0) {
        throw new Error("Duration must be greater than zero");
      }

      const flight = await createFlight({
        origin: origin.trim(),
        destination: destination.trim(),
        durationMinutes: resolvedDuration,
        blockedDomains: domains
      });

      setFlight(flight);
      setBlocked(domains);

      router.replace({
        pathname: "/(app)/active-flight",
        params: { flightId: flight.id }
      });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to launch mission");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-zinc-950">
      <ScrollView className="flex-1 px-6 pt-12" contentContainerStyle={{ paddingBottom: 140 }}>
        <Text className="text-3xl font-semibold text-sky-400">PreFlight</Text>
        <Text className="mt-2 text-sm text-zinc-400">Configure your next deep-work mission.</Text>

        <View className="mt-8 gap-5 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <Input
            label="Origin"
            value={origin}
            onChangeText={setOrigin}
            placeholder="Home Base"
          />

          <Input
            label="Destination"
            value={destination}
            onChangeText={setDestination}
            placeholder="Deep Work"
          />

          <View className="gap-2">
            <Text className="text-sm font-medium text-zinc-400">Duration</Text>
            <View className="flex-row flex-wrap gap-2">
              {PRESET_DURATIONS.map((duration) => {
                const active = selectedDuration === duration && customDuration.trim().length === 0;

                return (
                  <Pressable
                    key={duration}
                    className={`rounded-full border px-4 py-2 ${active ? "border-sky-400 bg-sky-400/20" : "border-zinc-700 bg-zinc-800"}`}
                    onPress={() => {
                      setSelectedDuration(duration);
                      setCustomDuration("");
                    }}
                  >
                    <Text className={`text-sm font-medium ${active ? "text-sky-300" : "text-zinc-300"}`}>{duration} min</Text>
                  </Pressable>
                );
              })}
            </View>
            <TextInput
              className="mt-2 h-12 rounded-xl border border-zinc-700 bg-zinc-800 px-4 text-base text-zinc-100"
              keyboardType="numeric"
              value={customDuration}
              onChangeText={setCustomDuration}
              placeholder="Custom duration (minutes)"
              placeholderTextColor="#71717a"
            />
          </View>

          <View className="gap-2">
            <Text className="text-sm font-medium text-zinc-400">Blocked Apps/Sites</Text>
            <View className="flex-row gap-2">
              <TextInput
                className="h-12 flex-1 rounded-xl border border-zinc-700 bg-zinc-800 px-4 text-base text-zinc-100"
                value={domainInput}
                onChangeText={setDomainInput}
                placeholder="Add domain (e.g. youtube.com)"
                placeholderTextColor="#71717a"
                autoCapitalize="none"
                onSubmitEditing={addDomain}
              />
              <Pressable className="h-12 items-center justify-center rounded-xl bg-sky-500 px-4" onPress={addDomain}>
                <Text className="text-sm font-semibold text-white">Add</Text>
              </Pressable>
            </View>
            <View className="mt-2 flex-row flex-wrap gap-2">
              {domains.map((domain) => (
                <Pressable
                  key={domain}
                  className="flex-row items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800 px-3 py-2"
                  onPress={() => removeDomain(domain)}
                >
                  <Text className="text-xs text-zinc-200">{domain}</Text>
                  <Text className="text-xs font-semibold text-red-400">x</Text>
                </Pressable>
              ))}
            </View>
            {Platform.OS === "android" ? (
              <Text className="mt-1 text-xs text-zinc-500">
                Enter app names - we'll match them to installed packages
              </Text>
            ) : null}
          </View>

          {error ? <Text className="text-sm text-red-400">{error}</Text> : null}
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 border-t border-zinc-800 bg-zinc-950 px-6 pb-8 pt-4">
        <Button
          label={`Launch Mission (${resolvedDuration} min)`}
          onPress={() => void launchMission()}
          loading={loading}
          variant="primary"
        />
      </View>
    </View>
  );
}
