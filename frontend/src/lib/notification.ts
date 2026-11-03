import { useAuthStore } from "@/stores/useAuthStore";
import type { Conversation } from "@/types/chat";

export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) return;
  const permission = await Notification.requestPermission();
  console.log("permission after request", permission); // thêm log
};

export const isMuted = (convo: Conversation): boolean => {
  const user = useAuthStore.getState().user;
  if (!user) return false;

  const muted = convo.mutedBy?.find((m) => m.userId === user._id);

  if (!muted) return false;

  if (!muted.mutedUntil) return true;

  return new Date(muted.mutedUntil) > new Date();
};

let notificationCount = 0;
const originalTitle = document.title;

export const showNotification = (
  title: string,
  body: string,
  icon?: string,
) => {
  if (document.visibilityState === "visible") return;

  // browser notification
  if (Notification.permission === "granted") {
    new Notification(title, { body, icon });
  }

  // title document notification
  notificationCount++;
  document.title = `(${notificationCount}) ${title} - ${originalTitle}`;
};

export const clearNotification = () => {
  notificationCount = 0;
  document.title = originalTitle;
};