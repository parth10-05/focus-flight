import { Text, View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";

type MissionTimerProps = {
  percentComplete: number;
  remaining: number;
  size?: number;
};

function formatRemaining(totalSeconds: number): string {
  const clamped = Math.max(0, totalSeconds);
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function getArcColor(percentComplete: number): string {
  const remainingRatio = 1 - Math.min(1, Math.max(0, percentComplete));

  if (remainingRatio > 0.5) {
    return "#38bdf8";
  }

  if (remainingRatio > 0.1) {
    return "#fbbf24";
  }

  return "#f87171";
}

export default function MissionTimer({
  percentComplete,
  remaining,
  size = 240
}: MissionTimerProps): JSX.Element {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(1, Math.max(0, percentComplete));
  const dashOffset = circumference * clamped;
  const arcColor = getArcColor(clamped);

  return (
    <View className="items-center justify-center" style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#27272a"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={arcColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={dashOffset}
          />
        </G>
      </Svg>
      <View className="absolute items-center">
        <Text className="text-5xl font-semibold tracking-wider text-zinc-100">{formatRemaining(remaining)}</Text>
        <Text className="mt-2 text-xs uppercase tracking-[0.25em] text-zinc-500">remaining</Text>
      </View>
    </View>
  );
}
