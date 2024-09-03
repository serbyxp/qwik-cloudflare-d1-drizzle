import type { UserId, UserSession } from "~/database";
import {
  createFollow,
  deleteFollow,
  getFollow,
  getFollowersForUser,
} from "~/database/following";

export async function followUserUseCase(
  authenticatedUser: UserSession,
  foreignUserId: UserId
) {
  await createFollow({ userId: authenticatedUser.id, foreignUserId });
}

export async function unFollowUserUseCase(
  authenticatedUser: UserSession,
  foreignUserId: UserId
) {
  await deleteFollow(authenticatedUser.id, foreignUserId);
}

export async function isFollowingUserUseCase(
  authenticatedUser: UserSession,
  foreignUserId: UserId
) {
  const follow = await getFollow(authenticatedUser.id, foreignUserId);
  return !!follow;
}

export async function getFollowersForUserUseCase(userId: UserId) {
  return getFollowersForUser(userId);
}
