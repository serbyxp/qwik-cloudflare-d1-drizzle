import { and, count, eq, ilike, sql } from "drizzle-orm";
//
import type { UserId } from "~/database";
import { getDB, membershipsTable } from "~/database";
import type { Group, GroupId, NewGroup } from "./groups.types";
import { groupsTable } from "./groups.schema";
import { omit } from "~/utils/omit";

function appendGroupMemberCount<T extends { memberships: any[] }>(group: T) {
  return omit(
    {
      ...group,
      memberCount: group.memberships.length + 1,
    },
    "memberships"
  );
}

export async function createGroup(group: NewGroup, db = getDB()) {
  await db.insert(groupsTable).values(group);
}

export async function searchPublicGroupsByName(
  search: string,
  page: number,
  db = getDB()
) {
  const GROUPS_PER_PAGE = 9;

  const condition = search
    ? and(
        eq(groupsTable.isPublic, true),
        ilike(groupsTable.name, `%${search}%`)
      )
    : eq(groupsTable.isPublic, true);

  const userMemberships = await db.query.groupsTable.findMany({
    where: condition,
    with: {
      memberships: true,
    },
    limit: GROUPS_PER_PAGE,
    offset: (page - 1) * GROUPS_PER_PAGE,
  });

  const [countResult] = await db
    .select({
      count: sql`count(*)`.mapWith(Number).as("count"),
    })
    .from(groupsTable)
    .where(condition);

  return {
    data: userMemberships.map(appendGroupMemberCount),
    total: countResult.count,
    perPage: GROUPS_PER_PAGE,
  };
}

export async function getPublicGroupsByUser(userId: UserId, db = getDB()) {
  const userGroups = await db.query.groupsTable.findMany({
    where: and(eq(groupsTable.userId, userId), eq(groupsTable.isPublic, true)),
    with: {
      memberships: true,
    },
  });

  return userGroups.map(appendGroupMemberCount);
}

export async function countUserGroups(userId: UserId, db = getDB()) {
  const [{ count: total }] = await db
    .select({ count: count() })
    .from(groupsTable)
    .where(eq(groupsTable.userId, userId));
  return total;
}

export async function getGroupsByUser(userId: UserId, db = getDB()) {
  const userGroups = await db.query.groupsTable.findMany({
    where: eq(groupsTable.userId, userId),
    with: {
      memberships: true,
    },
  });

  return userGroups.map(appendGroupMemberCount);
}

export async function getGroupsByMembership(userId: UserId, db = getDB()) {
  const userMemberships = await db.query.membershipsTable.findMany({
    where: eq(membershipsTable.userId, userId),
    with: {
      group: {
        with: {
          memberships: true,
        },
      },
    },
  });

  return userMemberships.map((membership) => {
    const group = membership.group;
    return appendGroupMemberCount(group);
  });
}

export async function getPublicGroupsByMembership(
  userId: UserId,
  db = getDB()
) {
  const userMemberships = await db.query.membershipsTable.findMany({
    where: eq(membershipsTable.userId, userId),
    with: {
      group: {
        with: {
          memberships: true,
        },
      },
    },
  });

  return userMemberships
    .filter((userMembership) => userMembership.group.isPublic)
    .map((membership) => {
      const group = membership.group;
      return appendGroupMemberCount(group);
    });
}

export async function getGroupById(groupId: GroupId, db = getDB()) {
  return await db.query.groupsTable.findFirst({
    where: eq(groupsTable.id, groupId),
  });
}

export async function updateGroup(
  groupId: GroupId,
  updatedGroup: Partial<Group>,
  db = getDB()
) {
  await db
    .update(groupsTable)
    .set(updatedGroup)
    .where(eq(groupsTable.id, groupId));
}

export async function deleteGroup(groupId: GroupId, db = getDB()) {
  await db.delete(groupsTable).where(eq(groupsTable.id, groupId));
}

export async function getGroupMembers(groupId: GroupId, db = getDB()) {
  return await db.query.membershipsTable.findMany({
    where: eq(membershipsTable.groupId, groupId),
    with: {
      profile: {
        columns: { displayName: true, image: true },
      },
    },
  });
}

export async function getGroupMembersCount(groupId: GroupId, db = getDB()) {
  const [{ count: total }] = await db
    .select({ count: count() })
    .from(membershipsTable)
    .where(eq(membershipsTable.groupId, groupId));
  return total;
}

export async function getUsersInGroup(groupId: GroupId, db = getDB()) {
  return await db.query.membershipsTable.findMany({
    where: eq(membershipsTable.groupId, groupId),
  });
}
