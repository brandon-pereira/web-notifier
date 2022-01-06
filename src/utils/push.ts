import webpush, { PushSubscription } from "web-push";
import SubscriptionError from "./subscriptionError";

export interface VapidKeys {
  publicKey: string;
  privateKey: string;
  email: string;
}

interface Configuration<NotificationPayload> {
  keys: VapidKeys;
  notificationDefaults?: Partial<NotificationPayload>;
}

class Push<NotificationPayload> {
  keys: VapidKeys;
  notificationDefaults?: Partial<NotificationPayload>;

  constructor(config: Configuration<NotificationPayload>) {
    this.keys = config.keys;
    this.notificationDefaults = config.notificationDefaults;
    this.init();
  }

  init() {
    webpush.setVapidDetails(
      `mailto:${this.keys.email}`,
      this.keys.publicKey,
      this.keys.privateKey
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
  async sendNotification(
    userId: string,
    payload: NotificationPayload,
    subscription: string
  ) {
    const pushSubscription = this._parseSubscription(subscription);
    if (
      pushSubscription &&
      pushSubscription.keys &&
      pushSubscription.keys.p256dh &&
      pushSubscription.keys.auth
    ) {
      const message = {
        ...this.notificationDefaults,
        ...payload,
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

  _parseSubscription(subscription: string): PushSubscription | null {
    let parsedSubscription: PushSubscription;
    try {
      parsedSubscription = JSON.parse(subscription) as PushSubscription;
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

  _generateInvalidSubscriptionError(
    userId: string,
    pushSubscription: PushSubscription | string
  ) {
    const error = new SubscriptionError(
      "Invalid User Subscription",
      userId,
      typeof pushSubscription === "object"
        ? JSON.stringify(pushSubscription)
        : pushSubscription
    );
    return error;
  }
}

export default Push;
