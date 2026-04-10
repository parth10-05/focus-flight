import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { supabase } from "../../lib/supabase";

export default function SignupScreen(): JSX.Element {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async () => {
    setLoading(true);
    setError(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password
    });

    if (signUpError) {
      setLoading(false);
      setError(signUpError.message);
      return;
    }

    const userId = data.user?.id ?? data.session?.user?.id;

    if (userId) {
      const { error: profileError } = await supabase.from("user_profiles").upsert(
        {
          user_id: userId,
          display_name: displayName.trim() || null,
          updated_at: new Date().toISOString()
        },
        { onConflict: "user_id" }
      );

      if (profileError) {
        setLoading(false);
        setError(profileError.message);
        return;
      }
    }

    setLoading(false);
    router.replace("/(app)/cockpit");
  };

  return (
    <View className="flex-1 justify-center bg-zinc-950 px-6">
      <View className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <Text className="mb-6 text-3xl font-semibold tracking-wide text-sky-400">Create account</Text>

        <View className="gap-4">
          <Input
            label="Display name"
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Call sign"
          />
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
            placeholder="Create a password"
          />
        </View>

        {error ? <Text className="mt-4 text-sm text-red-400">{error}</Text> : null}

        <View className="mt-6 gap-4">
          <Button label="Sign Up" onPress={() => void handleSignUp()} loading={loading} variant="primary" />
          <View className="flex-row items-center justify-center gap-1">
            <Text className="text-sm text-zinc-400">Already have an account?</Text>
            <Link href="/login" className="text-sm font-semibold text-sky-400">
              Log in
            </Link>
          </View>
        </View>
      </View>
    </View>
  );
}
