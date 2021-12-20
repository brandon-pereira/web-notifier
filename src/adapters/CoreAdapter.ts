// All adapters should `implement` this interface
export interface Adapter<
  NotificationFormat,
  UserIdFormat = string,
  NotificationIdFormat = string
> {
  scheduleNotification(
    date: Date,
    userId: UserIdFormat,
    payload: Object
  ): Promise<void>;

  fetchNotifications(
    date: Date
  ): Promise<
    Notification<NotificationFormat, UserIdFormat, NotificationIdFormat>[]
  >;

  clearNotification(id: NotificationIdFormat): Promise<boolean>;
}

// There is a notion of "Notification" which contains abstract send information, and
// "NotificationPayload" which is details to send to user.
export interface Notification<
  NotificationFormat,
  UserIdFormat,
  NotificationIdFormat
> {
  id: NotificationIdFormat;
  date: Date;
  userId: UserIdFormat;
  payload: NotificationFormat;
}
