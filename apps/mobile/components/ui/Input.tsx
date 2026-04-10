import { Text, TextInput, View } from "react-native";

type InputProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  secureTextEntry?: boolean;
  placeholder?: string;
  error?: string;
};

export default function Input({
  label,
  value,
  onChangeText,
  secureTextEntry = false,
  placeholder,
  error
}: InputProps): JSX.Element {
  return (
    <View className="w-full gap-2">
      <Text className="text-sm font-medium text-zinc-400">{label}</Text>
      <TextInput
        className={`h-12 rounded-xl border bg-zinc-800 px-4 text-base text-zinc-100 ${error ? "border-red-400" : "border-zinc-700"}`}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        placeholder={placeholder}
        placeholderTextColor="#71717a"
        autoCapitalize="none"
      />
      {error ? <Text className="text-sm text-red-400">{error}</Text> : null}
    </View>
  );
}
