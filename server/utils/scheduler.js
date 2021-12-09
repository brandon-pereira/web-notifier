const schedule = require("node-schedule");

class Scheduler {
  constructor({ adapter, sendNotification, removeUserPushSubscription }) {
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
    const rule = new schedule.RecurrenceRule();
    rule.second = [new schedule.Range(0, 59)];
    schedule.scheduleJob(rule, () => this.checkAndSendNotifications());
  }

  schedule(date, userId, payload) {
    return this.adapter.scheduleNotification(date, userId, payload);
  }

  cancelNotification(notificationId) {
    return this.adapter.clearNotification(notificationId);
  }

  async checkAndSendNotifications() {
    const notifications = await this.adapter.fetchNotifications(new Date());
    if (notifications && notifications.length) {
      console.info(
        `${notifications.length} notifications in the queue. Notifying users.`
      );
      await Promise.all(
        notifications.map(async notification => {
          try {
            await this.sendNotification(notification);
            await this.adapter.clearNotification(notification);
          } catch (err) {
            console.error(
              "Error sending notification, removing from queue",
              err
            );
            await this.adapter.clearNotification(notification);
            if (
              err.code === "INVALID_SUBSCRIPTION" &&
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

module.exports = Scheduler;
