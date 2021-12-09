module.exports = async VAPID_PUBLIC_KEY => {
  if (navigator.serviceWorker && VAPID_PUBLIC_KEY) {
    try {
      const reg = await navigator.serviceWorker.ready;
      const subscribeOptions = {
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      };
      const subscription = await reg.pushManager.subscribe(subscribeOptions);
      const jsonSubscription = JSON.stringify(subscription);
      return jsonSubscription;
    } catch (err) {
      console.error("Received error while getting user subscription", err);
      return null;
    }
  } else {
    console.error("No Service Worker detected or no VAPID_PUBLIC_KEY");
  }
};

// https://gist.github.com/malko/ff77f0af005f684c44639e4061fa8019
const urlBase64ToUint8Array = base64String => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
};
