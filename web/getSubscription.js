module.exports = async () => {
  if (navigator.serviceWorker) {
    try {
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.getSubscription();
      if (subscription) {
        const jsonSubscription = JSON.stringify(subscription);
        return jsonSubscription;
      }
      return false;
    } catch (err) {
      console.error("Received error while getting user subscription", err);
      return false;
    }
  } else {
    console.error("No Service Worker detected ");
    return false;
  }
};
