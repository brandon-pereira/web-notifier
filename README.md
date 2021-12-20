# Web Notifier

`web-notifier` is a an backend library for abstracting push notification logic in Node.

We take care of the hard stuff:

- Sending notifications
- Managing push subscriptions
- Notification scheduling

The goal of this library is to abstract away the notification queue and validation logic and allow you to focus on your business logic.

## Getting Started

Follow these steps to get the server logic setup quickly.

1. Install the dependency

   ```bash
   npm i -S web-notifier
   ```

2. Before we continue, you'll need to generate valid VAPID keys (if you haven't already) and store them for future use.

   ```bash
   npx web-push generate-vapid-keys
   ```

   There are two VAPID keys:

   - `private key` which should not be publicly accessible.
   - `public key` which can referenced in your frontend code.

   We recommend using a tool like [dotenv](https://www.npmjs.com/package/dotenv) to manage both public and private keys.

3. Instantiate an instance on the server

```js
import WebNotifier, { InMemoryAdapter } "web-notifier";

const notifier = new WebNotifier({
  vapidKeys: {
    publicKey: process.env.VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY,
    email: process.env.VAPID_EMAIL,
  },
  notificationDefaults: {
    badge: "/notification-badge.png",
    icon: "/android-chrome-192x192.png",
    url: "/",
  },
  getUserPushSubscriptions,
  removeUserPushSubscriptions,
  adapter: new InMemoryAdapter(),
});
```

3. Send a push notification

```js
notifier.send(userId, {
  title: "This will send immediately",
});
```

You can also defer the message till a later date by using

```js
cont when = new Date();
when.setHour(when.getHour() + 1);
notifier.schedule(when, userId, {
  title: "This will send in 1 hour"
});
```

## Adapters

WebNotifier needs to store information somewhere. The following information needs to be stored:

- **Notification Queue** - When you call `notifier.schedule` or `notifier.send` we store the notification and payload. We then periodically crawl storage for notifications that are ready to be sent.

The following adapters are available:

- **InMemory** - **DO NOT USE THIS IN PRODUCTION** - It's used to quickly scaffold and test, but the storage mechanism should be resilient to server restarts.

- **MongoDb** - This leverages MongoDB and [mongoose](https://mongoosejs.com/) as a storage mechanism

- **CoreAdapter** - If you need to implement your own storage mechanism for another service, the implementation should extend from CoreAdapter. `InMemory` adapter will be a good reference of how to properly construct an adapter.
