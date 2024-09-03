import type { notificationsTable } from "./notifications.schema";

export type Notification = typeof notificationsTable.$inferSelect;
export type NewNotification = typeof notificationsTable.$inferInsert;

export type NotificationId = Notification["id"];
