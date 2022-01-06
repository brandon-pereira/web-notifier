import { Adapter } from "../adapters/CoreAdapter";
import SubscriptionError from "./subscriptionError";

type sendNotification<NotificationFormat> = (
  userId: string,
  payload: NotificationFormat
) => Promise<void>;

type removeUserPushSubscription = (
  userId: string,
  pushSubscription: string
) => Promise<void>;

type SchedulerOptions<NotificationFormat> = {
  adapter: Adapter<NotificationFormat>;
  sendNotification: sendNotification<NotificationFormat>;
  removeUserPushSubscription: removeUserPushSubscription;
};

class Scheduler<NotificationFormat> {
  adapter: Adapter<NotificationFormat>;
  sendNotification: sendNotification<NotificationFormat>;
  removeUserPushSubscription: removeUserPushSubscription;

  constructor({
    adapter,
    sendNotification,
    removeUserPushSubscription,
  }: SchedulerOptions<NotificationFormat>) {
    if (!adapter) {
      throw new Error("Error: No adapter provided.");
    }
    this.adapter = adapter;
    this.sendNotification = sendNotification;
    this.removeUserPushSubscription = removeUserPushSubscription;
    this.checkAndSendNotifications = this.checkAndSendNotifications.bind(this);
    this.init();
  }

  init() {
    this.checkAndSendNotifications();
    setInterval(() => {
      this.checkAndSendNotifications();
    }, 5000);
  }

  schedule(date: Date, userId: string, payload: Partial<NotificationFormat>) {
    return this.adapter.scheduleNotification(date, userId, payload);
  }

  cancelNotification(notificationId: string) {
    return this.adapter.clearNotification(notificationId);
  }

  async checkAndSendNotifications() {
    const notifications = await this.adapter.fetchNotifications(new Date());
    if (notifications && notifications.length) {
      console.info(
        `${notifications.length} notifications in the queue. Notifying users.`
      );
      await Promise.all(
        notifications.map(async (notification) => {
          try {
            await this.sendNotification(
              notification.userId,
              notification.payload
            );
            await this.adapter.clearNotification(notification.id);
          } catch (err) {
            console.error(
              "Error sending notification, removing from queue",
              err
            );
            await this.adapter.clearNotification(notification.id);
            if (
              err instanceof SubscriptionError &&
              err.userId &&
              err.pushSubscription
            ) {
              console.log("Corrupt user subscription, removing...");
              this.removeUserPushSubscription(err.userId, err.pushSubscription);
            }
          }
        })
      );
    }
  }
}

export default Scheduler;
