import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";

import { deactivateBlocking } from "../lib/blockingService";
import { completeFlight, getActiveFlight } from "../lib/flightService";

export const FLIGHT_EXPIRY_TASK = "aerofocus-flight-expiry";

TaskManager.defineTask(FLIGHT_EXPIRY_TASK, async () => {
  try {
    const activeFlight = await getActiveFlight();

    if (!activeFlight?.id || !activeFlight.start_time) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    const startTimeMs = new Date(activeFlight.start_time).getTime();
    const expiryMs = startTimeMs + (activeFlight.duration * 1000);

    if (Number.isNaN(startTimeMs) || Date.now() <= expiryMs) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    await completeFlight(activeFlight.id);
    await deactivateBlocking();

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch {
    return BackgroundFetch.BackgroundFetchResult.NoData;
  }
});
