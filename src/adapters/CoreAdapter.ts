// All adapters should `implement` this interface
export interface Adapter<NotificationFormat, NotificationIdFormat = string> {
  scheduleNotification(
    date: Date,
    userId: string,
    payload: Object
  ): Promise<void>;

  fetchNotifications(
    date: Date
  ): Promise<Notification<NotificationFormat, NotificationIdFormat>[]>;

  clearNotification(id: NotificationIdFormat): Promise<boolean>;
}

// There is a notion of "Notification" which contains abstract send information, and
// "NotificationPayload" which is details to send to user.
export interface Notification<NotificationFormat, NotificationIdFormat> {
  id: NotificationIdFormat;
  date: Date;
  userId: string;
  payload: NotificationFormat;
}
