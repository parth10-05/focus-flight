import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { supabase } from "../../lib/supabase";

export default function LoginScreen(): JSX.Element {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.replace("/(app)/cockpit");
  };

  return (
    <View className="flex-1 justify-center bg-zinc-950 px-6">
      <View className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <Text className="mb-6 text-3xl font-semibold tracking-wide text-sky-400">Sign in</Text>

        <View className="gap-4">
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="pilot@aerofocus.io"
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Your password"
          />
        </View>

        {error ? <Text className="mt-4 text-sm text-red-400">{error}</Text> : null}

        <View className="mt-6 gap-4">
          <Button label="Sign In" onPress={() => void handleSignIn()} loading={loading} variant="primary" />
          <View className="flex-row items-center justify-center gap-1">
            <Text className="text-sm text-zinc-400">Need an account?</Text>
            <Link href="/signup" className="text-sm font-semibold text-sky-400">
              Sign up
            </Link>
          </View>
        </View>
      </View>
    </View>
  );
}
