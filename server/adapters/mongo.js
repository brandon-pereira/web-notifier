class Mongo {
  constructor(mongoose) {
    this.mongoose = mongoose;
    this.collection = mongoose.model("NotificationQueue", {
      userId: String,
      date: Date,
      payload: Object
    });
  }

  async scheduleNotification(date, userId, payload) {
    const insert = await this.collection.create({
      userId,
      date,
      payload
    });
    return insert._id;
  }

  async fetchNotifications(date) {
    return await this.collection.find({
      date: {
        $lt: date
      }
    });
  }

  async clearNotification(id) {
    return await this.collection.deleteOne({ _id: id });
  }
}

module.exports = Mongo;
