class InMemory {
  constructor(initialQueue = []) {
    this.queue = initialQueue;
  }

  async scheduleNotification(date, userId, payload) {
    const id = Math.random();
    this.queue.push({
      id,
      date,
      userId,
      payload
    });
  }

  async fetchNotifications(date) {
    return this.queue.filter(notification => notification.date <= date);
  }

  async clearNotification(id) {
    this.queue = this.queue.filter(n => n.id !== id);
    return true;
  }
}

module.exports = InMemory;
