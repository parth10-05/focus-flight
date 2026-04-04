import { useEffect, useState } from "react";

export function useElapsedTime(startTime: string | null): number {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!startTime) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setTick((prev) => prev + 1);
    }, 100);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [startTime]);

  if (!startTime) {
    return 0;
  }

  return Math.max(0, Date.now() - new Date(startTime).getTime());
}
