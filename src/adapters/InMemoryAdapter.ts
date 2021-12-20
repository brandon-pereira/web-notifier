import { Adapter } from "./CoreAdapter";

interface InMemoryNotification {
  id: number;
  date: Date;
  userId: string;
  payload: any;
}

class InMemory implements Adapter {
  queue: InMemoryNotification[];
  constructor(initialQueue: InMemoryNotification[] = []) {
    this.queue = initialQueue;
  }

  async scheduleNotification(date: Date, userId: string, payload: any) {
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
