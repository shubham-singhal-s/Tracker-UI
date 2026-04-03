import { useEffect, type FC } from "react";

export const NotificationSubscriber: FC = () => {
  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission !== "granted") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted" && "serviceWorker" in navigator) {
            navigator.serviceWorker.register("/sw.js").then(() => {});
          }
        });
      } else {
        navigator.serviceWorker.register("/sw.js").then(() => {});
      }
    }
  }, []);
  return null;
};
