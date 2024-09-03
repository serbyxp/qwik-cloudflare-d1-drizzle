import { and, eq } from "drizzle-orm";
//
import type { GroupId, PostId, UserId } from "~/database";
import { getDB } from "~/database";
import { notificationsTable } from "./notifications.schema";
import type { Notification, NotificationId } from "./notifications.types";

const MAX_NOTIFICATIONS_TO_RETURN = 30;
const MAX_NOTIFICATIONS_IN_HEADER = 3;

export async function createNotification(
  notification: {
    userId: UserId;
    groupId: GroupId;
    postId?: PostId;
    type: string;
    message: string;
    createdAt: Date;
  },
  db = getDB()
) {
  const [createdNotification] = await db
    .insert(notificationsTable)
    .values(notification)
    .returning();
  return createdNotification;
}

export async function getUnreadNotificationsForUser(
  userId: UserId,
  db = getDB()
) {
  return await db.query.notificationsTable.findMany({
    where: and(
      eq(notificationsTable.userId, userId),
      eq(notificationsTable.isRead, false)
    ),
    limit: MAX_NOTIFICATIONS_TO_RETURN,
  });
}

export async function getReadNotificationsForUser(
  userId: UserId,
  db = getDB()
) {
  return await db.query.notificationsTable.findMany({
    where: and(
      eq(notificationsTable.userId, userId),
      eq(notificationsTable.isRead, true)
    ),
    limit: MAX_NOTIFICATIONS_TO_RETURN,
  });
}

export async function getTop3UnreadNotificationsForUser(
  userId: UserId,
  db = getDB()
) {
  return await db.query.notificationsTable.findMany({
    where: and(
      eq(notificationsTable.userId, userId),
      eq(notificationsTable.isRead, false)
    ),
    limit: MAX_NOTIFICATIONS_IN_HEADER,
  });
}

export async function getNotificationsForUser(userId: UserId, db = getDB()) {
  return await db.query.notificationsTable.findMany({
    where: and(eq(notificationsTable.userId, userId)),
    limit: MAX_NOTIFICATIONS_TO_RETURN,
  });
}

export async function getNotificationById(
  notificationId: NotificationId,
  db = getDB()
) {
  return await db.query.notificationsTable.findFirst({
    where: eq(notificationsTable.id, notificationId),
  });
}

export async function updateNotification(
  notificationId: NotificationId,
  updatedNotification: Partial<Notification>,
  db = getDB()
) {
  const [notification] = await db
    .update(notificationsTable)
    .set(updatedNotification)
    .where(eq(notificationsTable.id, notificationId))
    .returning();
  return notification;
}

export async function deleteNotification(
  notificationId: NotificationId,
  db = getDB()
) {
  await db
    .delete(notificationsTable)
    .where(eq(notificationsTable.id, notificationId));
}
