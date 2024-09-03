import { and, eq } from "drizzle-orm";
//
import type { UserId, GroupId } from "~/database";
import { getDB } from "~/database";
import { membershipsTable } from "./membership.schema";
import type { MembershipId, Membership } from "./membership.types";

export async function getMembership(
  userId: UserId,
  groupId: GroupId,
  db = getDB()
) {
  return await db.query.membershipsTable.findFirst({
    where: and(
      eq(membershipsTable.userId, userId),
      eq(membershipsTable.groupId, groupId)
    ),
  });
}

export async function removeMembership(
  userId: UserId,
  groupId: GroupId,
  db = getDB()
) {
  await db
    .delete(membershipsTable)
    .where(
      and(
        eq(membershipsTable.userId, userId),
        eq(membershipsTable.groupId, groupId)
      )
    );
}

export async function addMembership(
  userId: UserId,
  groupId: GroupId,
  db = getDB()
) {
  await db.insert(membershipsTable).values({
    userId,
    groupId,
  });
}

export async function getMembershipsByUserId(userId: UserId, db = getDB()) {
  return await db.query.membershipsTable.findMany({
    where: eq(membershipsTable.userId, userId),
  });
}

export async function updateMembership(
  membershipId: MembershipId,
  updatedMembership: Partial<Membership>,
  db = getDB()
) {
  await db
    .update(membershipsTable)
    .set(updatedMembership)
    .where(eq(membershipsTable.id, membershipId));
}
