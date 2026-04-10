import { Stack, usePathname, useRouter, useSegments } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native";
import type { Session } from "@supabase/supabase-js";

import { registerBackgroundTasks } from "../lib/backgroundSetup";
import { SessionContext } from "../lib/sessionContext";
import { supabase } from "../lib/supabase";

export default function RootLayout(): JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const hasRegisteredBackgroundTasks = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (error) {
        setSession(null);
      } else {
        setSession(data.session ?? null);
      }

      setLoading(false);
    };

    void initialize();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) {
        return;
      }

      setSession(nextSession ?? null);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (loading) {
      return;
    }

    const inAuthGroup = segments[0] === "(auth)";

    if (!session && !inAuthGroup) {
      router.replace("/login");
    }

    if (session && inAuthGroup && pathname === "/login") {
      router.replace("/cockpit");
    }
  }, [loading, pathname, router, segments, session]);

  useEffect(() => {
    if (!session || hasRegisteredBackgroundTasks.current) {
      return;
    }

    hasRegisteredBackgroundTasks.current = true;
    void registerBackgroundTasks();
  }, [session]);

  const contextValue = useMemo(
    () => ({
      session,
      loading
    }),
    [loading, session]
  );

  if (loading) {
    return <View className="flex-1 bg-zinc-950" />;
  }

  return (
    <SessionContext.Provider value={contextValue}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(app)/preflight" options={{ presentation: "modal" }} />
      </Stack>
    </SessionContext.Provider>
  );
}
