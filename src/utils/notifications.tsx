import type { Notification } from "~/database";
import { LuCalendar, LuMessageCircle } from "@qwikest/icons/lucide";

export function getNotificationLink(notification: Notification) {
  const urls = {
    event: `/dashboard/groups/${notification.groupId}/events`,
    reply: `/dashboard/groups/${notification.groupId}/posts/${notification.postId}#replies`,
  } as any;
  return urls[notification.type];
}

export function getNotificationIcon(notification: Notification) {
  if (notification.type === "event") {
    return <LuCalendar class="w-5 h-5" />;
  } else if (notification.type === "reply") {
    return <LuMessageCircle class="w-5 h-5" />;
  }
}
