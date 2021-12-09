const webpush = require("web-push");

class Push {
  constructor({ publicKey, privateKey, email }, { defaults }) {
    this.publicKey = publicKey;
    this.privateKey = privateKey;
    this.email = email;
    this.defaults = defaults || {};
    this.init();
  }

  init() {
    webpush.setVapidDetails(
      `mailto:${this.email}`,
      this.publicKey,
      this.privateKey
    );
  }

  /**
   * Method to send push notification to the front-end.
   * @param {Object} payload Payload of notification
   * @param {Object} payload.title Title of notification (required)
   * @param {Object} payload.body Body of notification
   * @param {String} pushSubscription user push subscription
   * @return {Promise}
   */
  async sendNotification(userId, message, subscription) {
    if (!message || !message.title) {
      throw new Error("Incorrectly formatted message");
    }
    const pushSubscription = this._parseSubscription(subscription);
    if (
      pushSubscription &&
      pushSubscription.keys &&
      pushSubscription.keys.p256dh &&
      pushSubscription.keys.auth
    ) {
      message = {
        ...this.defaults,
        ...message
      };
      try {
        await webpush.sendNotification(
          pushSubscription,
          JSON.stringify(message)
        );
      } catch (err) {
        throw this._generateInvalidSubscriptionError(userId, pushSubscription);
      }
    } else {
      throw this._generateInvalidSubscriptionError(userId, subscription);
    }
  }

  _parseSubscription(subscription) {
    let parsedSubscription = {};
    try {
      parsedSubscription = JSON.parse(subscription);
      parsedSubscription.keys.p256dh = Buffer.from(
        parsedSubscription.keys.p256dh
      ).toString();
      parsedSubscription.keys.auth = Buffer.from(
        parsedSubscription.keys.auth
      ).toString();
    } catch (err) {
      return null;
    }
    return parsedSubscription;
  }

  static generateVAPIDKeys() {
    return webpush.generateVAPIDKeys();
  }

  _generateInvalidSubscriptionError(userId, pushSubscription) {
    const error = new Error("Invalid User Subscription");
    error.code = "INVALID_SUBSCRIPTION";
    error.userId = userId;
    error.pushSubscription =
      typeof pushSubscription === "object"
        ? JSON.stringify(pushSubscription)
        : pushSubscription;
    return error;
  }
}

module.exports = Push;
