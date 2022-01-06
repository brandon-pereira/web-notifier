import Push from "./utils/push";
import Scheduler from "./utils/scheduler";

import { Adapter } from "./adapters/CoreAdapter";

type VapidKeys = {
  publicKey: string;
  privateKey: string;
  email: string;
};

type removeUserPushSubscription = (
  userId: string,
  pushSubscription: string
) => Promise<void>;
type getUserPushSubscriptions = (userId: string) => Promise<string[]>;

interface DefaultNotificationFormat {
  title: string;
  description?: string;
  notificationBadge?: string;
  notificationIcon?: string;
  launchUrl?: string;
}

type WebNotifierArguments<NotificationFormat> = {
  vapidKeys: VapidKeys;
  notificationDefaults?: Partial<NotificationFormat>;
  getUserPushSubscriptions: getUserPushSubscriptions;
  removeUserPushSubscription: removeUserPushSubscription;
  adapter: Adapter<NotificationFormat>;
};

class WebNotifier<NotificationFormat = DefaultNotificationFormat> {
  push: Push<NotificationFormat>;
  scheduler: Scheduler<NotificationFormat>;
  vapidKeys: VapidKeys;
  getUserPushSubscriptions: getUserPushSubscriptions;

  constructor(config: WebNotifierArguments<NotificationFormat>) {
    this.vapidKeys = config.vapidKeys;
    this.push = new Push<NotificationFormat>({
      keys: this.vapidKeys,
      notificationDefaults: config.notificationDefaults || {},
    });
    this.getUserPushSubscriptions = config.getUserPushSubscriptions;
    this.scheduler = new Scheduler({
      adapter: config.adapter,
      removeUserPushSubscription: config.removeUserPushSubscription,
      sendNotification: this.sendNotification.bind(this),
    });
  }

  schedule(date: Date, userId: string, payload: NotificationFormat) {
    return this.scheduler.schedule(date, userId, payload);
  }

  send(userId: string, payload: NotificationFormat) {
    return this.schedule(new Date(), userId, payload);
  }

  cancelNotification(id: string) {
    return this.scheduler.cancelNotification(id);
  }

  async sendNotification(userId: string, payload: NotificationFormat) {
    const userSubscription = await this.getUserPushSubscriptions(userId);
    if (Array.isArray(userSubscription)) {
      await Promise.all(
        userSubscription.map((subscription) =>
          this.push.sendNotification(userId, payload, subscription)
        )
      );
    } else {
      await this.push.sendNotification(userId, payload, userSubscription);
    }
  }
}

export default WebNotifier;
