import { getDB, type NotificationId, type UserSession } from "~/database";
import {
  deleteNotification,
  getNotificationById,
  getReadNotificationsForUser,
  getUnreadNotificationsForUser,
  updateNotification,
} from "~/database/notifications";
import { AuthenticationError, NotFoundError } from "~/utils/app-util";

export async function assertOwnsNotification(
  authenticatedUser: UserSession,
  notificationId: NotificationId
) {
  const notification = await getNotificationById(notificationId);

  if (!notification) {
    throw new NotFoundError("notification not found");
  }

  if (notification.userId !== authenticatedUser.id) {
    throw new AuthenticationError();
  }

  return notification;
}

export async function markNotificationAsReadUseCase(
  authenticatedUser: UserSession,
  notificationId: NotificationId
) {
  await assertOwnsNotification(authenticatedUser, notificationId);
  return await updateNotification(notificationId, {
    isRead: true,
  });
}

export async function clearReadNotificationsUseCase(
  authenticatedUser: UserSession,
  db = getDB()
) {
  const unreadNotifications = await getReadNotificationsForUser(
    authenticatedUser.id,
    db
  );

  await Promise.all(
    unreadNotifications.map((notification) =>
      deleteNotification(notification.id, db)
    )
  );
}

export async function markAllNotificationsAsReadUseCase(
  authenticatedUser: UserSession,
  db = getDB()
) {
  const unreadNotifications = await getUnreadNotificationsForUser(
    authenticatedUser.id,
    db
  );

  await Promise.all(
    unreadNotifications.map((notification) =>
      updateNotification(
        notification.id,
        {
          isRead: true,
        },
        db
      )
    )
  );
}
