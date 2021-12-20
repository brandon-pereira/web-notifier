// All adapters should `implement` this interface
export interface Adapter {
  scheduleNotification(
    date: Date,
    userId: string,
    payload: Object
  ): Promise<void>;
}
