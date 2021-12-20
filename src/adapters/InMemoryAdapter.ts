import { Adapter, Notification } from "./CoreAdapter";

class InMemory<NotificationFormat, UserIdFormat>
  implements Adapter<NotificationFormat, UserIdFormat, number>
{
  queue: Notification<NotificationFormat, UserIdFormat, number>[];
  constructor(
    initialQueue: Notification<NotificationFormat, UserIdFormat, number>[] = []
  ) {
    this.queue = initialQueue;
  }

  async scheduleNotification(
    date: Date,
    userId: UserIdFormat,
    payload: NotificationFormat
  ) {
    const id = Math.random();
    this.queue.push({
      id,
      date,
      userId,
      payload,
    });
  }

  async fetchNotifications(date: Date) {
    return this.queue.filter((notification) => notification.date <= date);
  }

  async clearNotification(id: number) {
    this.queue = this.queue.filter((n) => n.id !== id);
    return true;
  }
}

export default InMemory;
