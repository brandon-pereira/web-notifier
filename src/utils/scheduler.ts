import { Adapter } from "../adapters/CoreAdapter";

type sendNotification<NotificationFormat, UserIdFormat> = (
  userId: UserIdFormat,
  payload: NotificationFormat
) => Promise<void>;

type removeUserPushSubscription<UserIdFormat> = (
  userId: UserIdFormat,
  pushSubscription: string
) => Promise<void>;

type SchedulerOptions<NotificationFormat, UserIdFormat> = {
  adapter: Adapter<NotificationFormat, UserIdFormat>;
  sendNotification: sendNotification<NotificationFormat, UserIdFormat>;
  removeUserPushSubscription: removeUserPushSubscription<UserIdFormat>;
};

class Scheduler<NotificationFormat, UserIdFormat> {
  adapter: Adapter<NotificationFormat, UserIdFormat>;
  sendNotification: sendNotification<NotificationFormat, UserIdFormat>;
  removeUserPushSubscription: removeUserPushSubscription<UserIdFormat>;

  constructor({
    adapter,
    sendNotification,
    removeUserPushSubscription,
  }: SchedulerOptions<NotificationFormat, UserIdFormat>) {
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

  schedule(
    date: Date,
    userId: UserIdFormat,
    payload: Partial<NotificationFormat>
  ) {
    return this.adapter.scheduleNotification(date, userId, payload);
  }

  cancelNotification(notificationId: string) {
    return this.adapter.clearNotification(notificationId);
  }

  async checkAndSendNotifications() {
    console.log("HELLO");
    const notifications = await this.adapter.fetchNotifications(new Date());
    if (notifications && notifications.length) {
      console.info(
        `${notifications.length} notifications in the queue. Notifying users.`
      );
      console.log(notifications);
      await Promise.all(
        notifications.map(async (notification) => {
          try {
            console.log(notification);
            // await this.sendNotification(notification);
            await this.adapter.clearNotification(notification);
          } catch (err) {
            console.error(
              "Error sending notification, removing from queue",
              err
            );
            await this.adapter.clearNotification(notification);
            // if (
            //   err.code === "INVALID_SUBSCRIPTION" &&
            //   err.userId &&
            //   err.pushSubscription
            // ) {
            //   console.log("Corrupt user subscription, removing...");
            //   this.removeUserPushSubscription(err.userId, err.pushSubscription);
            // }
          }
        })
      );
    }
  }
}

export default Scheduler;
