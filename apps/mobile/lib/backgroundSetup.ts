import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";

import { FLIGHT_EXPIRY_TASK } from "../tasks/flightExpiryTask";

export async function registerBackgroundTasks(): Promise<void> {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(FLIGHT_EXPIRY_TASK);
  if (isRegistered) {
    return;
  }

  // Keep foreground expiry handling active via useCountdown for tight timing behavior.
  await BackgroundFetch.registerTaskAsync(FLIGHT_EXPIRY_TASK, {
    minimumInterval: 60,
    stopOnTerminate: false,
    startOnBoot: true
  });
}
