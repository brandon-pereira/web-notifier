import { Adapter, Notification } from "./CoreAdapter";

class InMemory<NotificationFormat>
  implements Adapter<NotificationFormat, string>
{
  queue: Notification<NotificationFormat, string>[];
  constructor(initialQueue: Notification<NotificationFormat, string>[] = []) {
    this.queue = initialQueue;
  }

  async scheduleNotification(
    date: Date,
    userId: string,
    payload: NotificationFormat
  ) {
    const id = `${Math.random()}`;
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

  async clearNotification(id: string) {
    this.queue = this.queue.filter((n) => n.id !== id);
    return true;
  }
}

export default InMemory;
