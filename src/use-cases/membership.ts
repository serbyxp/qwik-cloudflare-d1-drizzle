import { NotFoundError } from "~/utils/app-util";
import type {
  GroupId,
  MemberRole,
  Role,
  UserId,
  UserSession,
} from "~/database";
import { getGroupById, getGroupsByUser } from "~/database/groups";
import {
  addMembership,
  getMembership,
  getMembershipsByUserId,
  removeMembership,
  updateMembership,
} from "~/database/membership";
import { assertGroupOwner, assertGroupVisible } from "./authorization";
import { PublicError } from "./errors";

export async function isGroupOwnerUseCase(
  authenticatedUser: UserSession | undefined,
  groupId: GroupId
) {
  if (!authenticatedUser) return false;

  const group = await getGroupById(groupId);

  if (!group) {
    throw new NotFoundError("Group not found");
  }

  const isGroupOwner = group.userId === authenticatedUser.id;
  return isGroupOwner;
}

export async function isUserMemberOfGroupUseCase(
  authenticatedUser: UserSession | undefined,
  groupId: GroupId
) {
  if (!authenticatedUser) return false;

  const membership = await getMembership(authenticatedUser.id, groupId);
  const group = await getGroupById(groupId);

  if (!group) {
    throw new PublicError("Group not found");
  }

  const isGroupOwner = group.userId === authenticatedUser.id;
  return !!membership || isGroupOwner;
}

export async function isGroupVisibleToUserUseCase(
  authenticatedUser: UserSession | undefined,
  groupId: GroupId
) {
  return await assertGroupVisible(authenticatedUser, groupId)
    .then(() => true)
    .catch(() => false);
}

export async function joinGroupUseCase(
  authenticatedUser: UserSession,
  groupId: GroupId
) {
  const membership = await getMembership(authenticatedUser.id, groupId);
  if (membership) {
    throw new PublicError("User is already a member of this group");
  }
  await addMembership(authenticatedUser.id, groupId);
}

export async function leaveGroupUseCase(
  authenticatedUser: UserSession,
  groupId: GroupId
) {
  const membership = await getMembership(authenticatedUser.id, groupId);
  if (!membership) {
    throw new PublicError("User is not a member of this group");
  }
  await removeMembership(authenticatedUser.id, groupId);
}

export async function getUserMembershipsUseCase(userId: UserId) {
  return getMembershipsByUserId(userId);
}

export async function getMembershipListUseCase(userId: UserId) {
  const memberships = await getMembershipsByUserId(userId);
  const ownedGroups = await getGroupsByUser(userId);

  return [
    ...ownedGroups.map((group) => ({
      groupId: group.id,
      role: "admin" as Role,
    })),
    ...memberships.map((membership) => ({
      groupId: membership.groupId,
      role: membership.role as Role,
    })),
  ];
}

export async function kickMemberUseCase(
  authenticatedUser: UserSession,
  { userId, groupId }: { userId: UserId; groupId: GroupId }
) {
  const membership = await getMembership(userId, groupId);
  if (!membership) {
    throw new PublicError("User is not a member of this group");
  }
  await assertGroupOwner(authenticatedUser, groupId);
  await removeMembership(userId, groupId);
}

export async function switchMemberRoleUseCase(
  authenticatedUser: UserSession,
  {
    userId,
    groupId,
    role,
  }: { userId: UserId; groupId: GroupId; role: MemberRole }
) {
  const membership = await getMembership(userId, groupId);
  if (!membership) {
    throw new PublicError("User is not a member of this group");
  }
  await assertGroupOwner(authenticatedUser, groupId);
  await updateMembership(membership.id, {
    role,
  });
}
