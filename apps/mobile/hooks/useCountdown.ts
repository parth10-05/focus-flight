import { useEffect, useMemo, useState } from "react";

type CountdownState = {
  remaining: number;
  percentComplete: number;
  isExpired: boolean;
};

function getRemainingSeconds(durationSeconds: number, startTime: string | null): number {
  if (!startTime) {
    return Math.max(0, durationSeconds);
  }

  const startedAtMs = new Date(startTime).getTime();
  if (Number.isNaN(startedAtMs)) {
    return Math.max(0, durationSeconds);
  }

  const elapsedSeconds = Math.floor((Date.now() - startedAtMs) / 1000);
  return Math.max(0, durationSeconds - elapsedSeconds);
}

export function useCountdown(durationSeconds: number, startTime: string | null): CountdownState {
  const [remaining, setRemaining] = useState(() => getRemainingSeconds(durationSeconds, startTime));

  useEffect(() => {
    setRemaining(getRemainingSeconds(durationSeconds, startTime));

    const intervalId = setInterval(() => {
      setRemaining(getRemainingSeconds(durationSeconds, startTime));
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [durationSeconds, startTime]);

  const percentComplete = useMemo(() => {
    if (durationSeconds <= 0) {
      return 1;
    }

    const elapsed = durationSeconds - remaining;
    return Math.min(1, Math.max(0, elapsed / durationSeconds));
  }, [durationSeconds, remaining]);

  return {
    remaining,
    percentComplete,
    isExpired: remaining <= 0
  };
}
