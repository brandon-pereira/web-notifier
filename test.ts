import "dotenv/config";
import WebNotifier from "./src";
import InMemoryAdapter from "./src/adapters/InMemoryAdapter";

const getUserPushSubscriptions = async (userId: string) => {
  console.log("getting user subscriptions", userId);
  return ["aaa"];
};
const removeUserPushSubscription = async (
  userId: string,
  pushSubscription: string
): Promise<void> => {
  console.log("Remove invalid subscription", userId, pushSubscription);
};

interface NotificationPayload {
  title: string;
  description?: string;
  notificationBadge?: string;
  notificationIcon?: string;
  launchUrl?: string;
}

const notifier = new WebNotifier<NotificationPayload>({
  vapidKeys: {
    publicKey: process.env.VAPID_PUBLIC_KEY || "foo",
    privateKey: process.env.VAPID_PRIVATE_KEY || "foo",
    email: process.env.VAPID_EMAIL || "foo",
  },
  notificationDefaults: {
    notificationBadge: "/notification-badge.png",
    notificationIcon: "/android-chrome-192x192.png",
    launchUrl: "/",
  },
  getUserPushSubscriptions,
  removeUserPushSubscription,
  adapter: new InMemoryAdapter<NotificationPayload, string>(),
});

notifier.send("1", {
  title: "Hello World",
});
