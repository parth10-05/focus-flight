import * as Notifications from "expo-notifications";

export async function requestPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted || current.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted || requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

export async function scheduleMissionReminder(
  flightId: string,
  endsAt: Date
): Promise<string | null> {
  const granted = await requestPermission();
  if (!granted) {
    return null;
  }

  const triggerDate = new Date(endsAt.getTime() - 2 * 60 * 1000);
  if (triggerDate.getTime() <= Date.now()) {
    return null;
  }

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "AeroFocus",
      body: "Your AeroFocus mission ends in 2 minutes",
      data: {
        flightId
      }
    },
    trigger: triggerDate
  });

  return notificationId;
}

export async function cancelReminder(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}
