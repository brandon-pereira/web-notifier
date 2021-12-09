# Web Notifier

`web-notifier` is a an easy to use library for providing push notifications on the web. We take care of all the hard stuff: scheduling, creating tokens, pushing to clients, and so on.

## Getting Started

1. Install the dependency:

```bash
npm i -S web-notifier
```

2. Generate VAPID Keys, these should be stored somewhere where they can be **reused between sessions** (ex. `process.env.VAPID_PRIVATE_KEY` and `process.env.VAPID_PUBLIC_KEY`).

```js
console.log(WebNotifier.generateVAPIDKeys());
```

2. Instantiate an instance on the server

```js
const { WebNotifier, MongoAdapter } = require("web-notifier");

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
  getUserPushSubscription,
  removeUserPushSubscription,
  adapter: new MongoAdapter(db.connection),
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
notifier.schedule(when, userId, {
  title: "This will send at variable 'when'."
});
```
