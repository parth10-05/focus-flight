import { ActivityIndicator, Pressable, Text } from "react-native";

type ButtonVariant = "primary" | "ghost" | "danger";

type ButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-sky-500",
  ghost: "border border-zinc-700 bg-transparent",
  danger: "bg-red-500"
};

const textVariantClasses: Record<ButtonVariant, string> = {
  primary: "text-white",
  ghost: "text-zinc-300",
  danger: "text-white"
};

export default function Button({
  label,
  onPress,
  loading = false,
  variant = "primary"
}: ButtonProps): JSX.Element {
  return (
    <Pressable
      className={`h-12 items-center justify-center rounded-xl px-4 ${variantClasses[variant]} ${loading ? "opacity-70" : ""}`}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color={variant === "ghost" ? "#d4d4d8" : "#ffffff"} />
      ) : (
        <Text className={`text-base font-semibold ${textVariantClasses[variant]}`}>{label}</Text>
      )}
    </Pressable>
  );
}
