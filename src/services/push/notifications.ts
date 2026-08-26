import * as Notifications from "expo-notifications";
import { apiClient } from "@/services/api/client";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotifications() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") return;

  const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync();
  await apiClient.post("/users/push-token", { token: expoPushToken });
}
