class SubscriptionError extends Error {
  code: string;
  userId?: string;
  pushSubscription?: string;

  constructor(public message: string, userId?: any, pushSubscription?: string) {
    super(message);
    this.name = "SubscriptionError";
    this.code = "INVALID_SUBSCRIPTION";
    this.userId = userId;
    this.pushSubscription = pushSubscription;
    this.stack = (<any>new Error()).stack;
  }
}

export default SubscriptionError;
