import mongoose, { Schema } from "mongoose";
import { Adapter, Notification } from "./CoreAdapter";

class MongoDbAdapter<NotificationFormat>
  implements Adapter<NotificationFormat, string>
{
  private queue: mongoose.Model<Notification<NotificationFormat, string>>;

  constructor() {
    const schema = new Schema<Notification<NotificationFormat, string>>({
      userId: String,
      date: Date,
      payload: Object,
    });
    this.queue = mongoose.model<Notification<NotificationFormat, string>>(
      "NotificationQueue",
      schema
    );
  }

  async scheduleNotification(
    date: Date,
    userId: string,
    payload: Notification<NotificationFormat, string>
  ) {
    const insert = await this.queue.create({
      userId,
      date,
      payload,
    });
    return insert.id;
  }

  async fetchNotifications(date: Date) {
    return await this.queue.find({
      date: {
        $lt: date,
      },
    });
  }

  async clearNotification(id: string): Promise<boolean> {
    const result = await this.queue.deleteOne({ _id: id });
    return result.acknowledged;
  }
}

export default MongoDbAdapter;
