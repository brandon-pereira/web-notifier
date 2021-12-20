import Push from "./utils/push";
import Scheduler from "./utils/scheduler";

import { Adapter } from "./adapters/CoreAdapter";

type VapidKeys = {
  publicKey: string;
  privateKey: string;
  email: string;
};

type removeUserPushSubscriptions<UserIdType> = (
  userId: UserIdType,
  pushSubscription: string
) => Promise<void>;
type getUserPushSubscriptions<UserIdPayload> = (
  userId: UserIdPayload
) => Promise<string[]>;

interface DefaultNotificationFormat {
  title: string;
  description?: string;
  notificationBadge?: string;
  notificationIcon?: string;
  launchUrl?: string;
}

type WebNotifierArguments<NotificationFormat, UserIdPayload> = {
  vapidKeys: VapidKeys;
  notificationDefaults?: Partial<NotificationFormat>;
  getUserPushSubscriptions: getUserPushSubscriptions<UserIdPayload>;
  removeUserPushSubscriptions: removeUserPushSubscriptions<UserIdPayload>;
  adapter: Adapter;
};

class WebNotifier<
  NotificationFormat = DefaultNotificationFormat,
  UserIdFormat = string
> {
  push: Push<NotificationFormat, UserIdFormat>;
  scheduler: Scheduler<NotificationFormat, UserIdFormat>;
  vapidKeys: VapidKeys;
  getUserPushSubscriptions: getUserPushSubscriptions<UserIdFormat>;

  constructor(config: WebNotifierArguments<NotificationFormat, UserIdFormat>) {
    this.vapidKeys = config.vapidKeys;
    this.push = new Push<NotificationFormat, UserIdFormat>({
      keys: this.vapidKeys,
      notificationDefaults: config.notificationDefaults || {},
    });
    this.getUserPushSubscriptions = config.getUserPushSubscriptions;
    this.scheduler = new Scheduler({
      adapter: config.adapter,
      removeUserPushSubscriptions: config.removeUserPushSubscriptions,
      sendNotification: this.sendNotification.bind(this),
    });
  }

  schedule(date: Date, userId: UserIdFormat, payload: NotificationFormat) {
    return this.scheduler.schedule(date, userId, payload);
  }

  send(userId: UserIdFormat, payload: NotificationFormat) {
    return this.schedule(new Date(), userId, payload);
  }

  cancelNotification(id: string) {
    return this.scheduler.cancelNotification(id);
  }

  private async sendNotification(
    userId: UserIdFormat,
    payload: NotificationFormat
  ) {
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
