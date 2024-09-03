import { and, eq } from "drizzle-orm";
//
import type { UserId } from "~/database";
import { getDB } from "~/database";
import { followingTable } from "./following.schema";

export async function createFollow(
  newFollow: {
    userId: UserId;
    foreignUserId: UserId;
  },
  db = getDB()
) {
  const [follow] = await db
    .insert(followingTable)
    .values(newFollow)
    .onConflictDoNothing()
    .returning();
  return follow;
}

export async function deleteFollow(
  userId: UserId,
  foreignUserId: UserId,
  db = getDB()
) {
  await db
    .delete(followingTable)
    .where(
      and(
        eq(followingTable.userId, userId),
        eq(followingTable.foreignUserId, foreignUserId)
      )
    );
}

export async function getFollow(
  userId: UserId,
  foreignUserId: UserId,
  db = getDB()
) {
  return await db.query.followingTable.findFirst({
    where: and(
      eq(followingTable.userId, userId),
      eq(followingTable.foreignUserId, foreignUserId)
    ),
  });
}

export async function getFollowersForUser(userId: UserId, db = getDB()) {
  const followers = await db.query.followingTable.findMany({
    where: eq(followingTable.foreignUserId, userId),
    with: {
      userProfile: true,
    },
  });

  return followers.map((follow) => follow.userProfile);
}
