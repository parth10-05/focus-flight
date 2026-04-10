import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import AppBlocker from "../../modules/app-blocker";
import { supabase } from "../../lib/supabase";
import { useFlightStore } from "../../store/useFlightStore";

export default function ProfileScreen(): JSX.Element {
  const router = useRouter();
  const clearFlight = useFlightStore((state) => state.clearFlight);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [domainInput, setDomainInput] = useState("");
  const [defaultBlockedApps, setDefaultBlockedApps] = useState<string[]>([]);
  const [hasBlockingPermission, setHasBlockingPermission] = useState(false);

  const appVersion = useMemo(
    () =>
      Constants.expoConfig?.version ??
      Constants.nativeAppVersion ??
      "dev",
    []
  );

  const refreshPermissionStatus = async () => {
    try {
      const granted = await AppBlocker.hasPermission();
      setHasBlockingPermission(granted);
    } catch {
      setHasBlockingPermission(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user?.id) {
          throw new Error(userError?.message ?? "Unable to resolve current user");
        }

        const userId = userData.user.id;
        const { data: profileData, error: profileError } = await supabase
          .from("user_profiles")
          .select("display_name, last_blocked_sites")
          .eq("user_id", userId)
          .maybeSingle();

        if (profileError) {
          throw new Error(profileError.message);
        }

        if (!mounted) {
          return;
        }

        setDisplayName(profileData?.display_name ?? "");
        setDefaultBlockedApps(
          Array.isArray(profileData?.last_blocked_sites)
            ? profileData.last_blocked_sites
            : []
        );

        await refreshPermissionStatus();
      } catch (nextError) {
        if (!mounted) {
          return;
        }
        setError(nextError instanceof Error ? nextError.message : "Failed to load profile");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  const addBlockedApp = () => {
    const value = domainInput.trim().toLowerCase();
    if (!value) {
      return;
    }

    if (defaultBlockedApps.includes(value)) {
      setDomainInput("");
      return;
    }

    setDefaultBlockedApps((current) => [...current, value]);
    setDomainInput("");
  };

  const removeBlockedApp = (entry: string) => {
    setDefaultBlockedApps((current) => current.filter((item) => item !== entry));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user?.id) {
        throw new Error(userError?.message ?? "Unable to resolve current user");
      }

      const { error: upsertError } = await supabase.from("user_profiles").upsert(
        {
          user_id: userData.user.id,
          display_name: displayName.trim() || null,
          last_blocked_sites: defaultBlockedApps,
          updated_at: new Date().toISOString()
        },
        { onConflict: "user_id" }
      );

      if (upsertError) {
        throw new Error(upsertError.message);
      }
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    setError(null);

    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        throw new Error(signOutError.message);
      }

      clearFlight();
      router.replace("/login");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to sign out");
    } finally {
      setSigningOut(false);
    }
  };

  const handleGrantPermission = async () => {
    await AppBlocker.requestPermission();
    await refreshPermissionStatus();
  };

  if (loading) {
    return <View className="flex-1 bg-zinc-950" />;
  }

  return (
    <View className="flex-1 bg-zinc-950 px-6 pt-14 pb-8">
      <Text className="text-3xl font-semibold text-sky-300">Profile</Text>
      <Text className="mt-2 text-sm text-zinc-400">Pilot preferences and mission defaults</Text>

      <View className="mt-6 gap-5 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <Input
          label="Display Name"
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Pilot call sign"
        />

        <View className="gap-2">
          <Text className="text-sm font-medium text-zinc-400">Default Blocked Apps</Text>
          <View className="flex-row gap-2">
            <TextInput
              className="h-12 flex-1 rounded-xl border border-zinc-700 bg-zinc-800 px-4 text-base text-zinc-100"
              value={domainInput}
              onChangeText={setDomainInput}
              placeholder="Add app/domain"
              placeholderTextColor="#71717a"
              autoCapitalize="none"
              onSubmitEditing={addBlockedApp}
            />
            <Pressable className="h-12 items-center justify-center rounded-xl bg-sky-500 px-4" onPress={addBlockedApp}>
              <Text className="text-sm font-semibold text-white">Add</Text>
            </Pressable>
          </View>

          <View className="mt-2 flex-row flex-wrap gap-2">
            {defaultBlockedApps.map((item) => (
              <Pressable
                key={item}
                className="flex-row items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800 px-3 py-2"
                onPress={() => removeBlockedApp(item)}
              >
                <Text className="text-xs text-zinc-200">{item}</Text>
                <Text className="text-xs font-semibold text-red-400">x</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3">
          <View className="flex-row items-center justify-between">
            <View className="pr-4">
              <Text className="text-xs uppercase tracking-[0.2em] text-zinc-500">Blocking Permission</Text>
              <Text className={`mt-1 text-sm font-semibold ${hasBlockingPermission ? "text-emerald-300" : "text-amber-300"}`}>
                {hasBlockingPermission ? "Granted" : "Not granted"}
              </Text>
            </View>
            {!hasBlockingPermission ? (
              <Button label="Grant Permission" onPress={() => void handleGrantPermission()} variant="ghost" />
            ) : null}
          </View>
        </View>

        <View className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3">
          <Text className="text-xs uppercase tracking-[0.2em] text-zinc-500">App Version</Text>
          <Text className="mt-1 text-sm font-semibold text-zinc-200">{appVersion}</Text>
        </View>

        {error ? <Text className="text-sm text-red-400">{error}</Text> : null}

        <View className="gap-3 pt-1">
          <Button label="Save Profile" onPress={() => void handleSave()} loading={saving} variant="primary" />
          <Button label="Sign Out" onPress={() => void handleSignOut()} loading={signingOut} variant="danger" />
        </View>
      </View>
    </View>
  );
}
