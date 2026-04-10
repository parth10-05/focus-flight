import { Pressable, Text, View } from "react-native";

type BlockingPermissionBannerProps = {
  visible: boolean;
  onRequestPermission: () => void;
};

export default function BlockingPermissionBanner({
  visible,
  onRequestPermission
}: BlockingPermissionBannerProps): JSX.Element {
  if (!visible) {
    return null;
  }

  return (
    <Pressable onPress={onRequestPermission}>
      <View className="mt-4 rounded-xl border border-amber-500/60 bg-amber-900/30 px-4 py-3">
        <Text className="text-sm font-semibold text-amber-300">
          App blocking inactive — tap to grant permission
        </Text>
      </View>
    </Pressable>
  );
}
