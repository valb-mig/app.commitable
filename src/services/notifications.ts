import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export const COMMIT_ACTION_ID = "commit_now";
const CATEGORY_ID = "habit_reminder";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function setupNotificationCategory(): Promise<void> {
  await Notifications.setNotificationCategoryAsync(CATEGORY_ID, [
    {
      identifier: COMMIT_ACTION_ID,
      buttonTitle: "✓ Commit",
      options: { isDestructive: false, isAuthenticationRequired: false },
    },
  ]);
}

export async function requestPermission(): Promise<boolean> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Commitable",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function scheduleDaily(
  habitId: string,
  habitName: string,
  hour: number,
  minute: number
): Promise<string> {
  await cancelForHabit(habitId);

  const id = await Notifications.scheduleNotificationAsync({
    identifier: `habit-${habitId}`,
    content: {
      title: "Commitable",
      body: `Don't forget to commit: ${habitName}`,
      data: { habitId },
      categoryIdentifier: CATEGORY_ID,
    },
    trigger: {
      hour,
      minute,
      repeats: true,
    },
  });
  return id;
}

export async function cancelForHabit(habitId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(`habit-${habitId}`);
}

export async function cancelAll(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function getScheduled(): Promise<Notifications.NotificationRequest[]> {
  return Notifications.getAllScheduledNotificationsAsync();
}
