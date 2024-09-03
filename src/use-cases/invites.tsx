/** @jsxImportSource react */
import { getDB, type GroupId, type UserSession } from "~/database";
import { createInvite, deleteInvite, getInvite } from "~/database/invites";
import { addMembership } from "~/database/membership";
import { InviteEmail } from "~/emails/invite";
import { sendEmail } from "~/lib/send-email";
import {
  assertAdminOrOwnerOfGroup,
  assertGroupExists,
} from "~/use-cases/authorization";
import { PublicError } from "~/use-cases/errors";

export async function sendInviteUseCase(
  authenticatedUser: UserSession,
  { email, groupId }: { email: string; groupId: GroupId }
) {
  await assertAdminOrOwnerOfGroup(authenticatedUser, groupId);
  const group = await assertGroupExists(groupId);
  const invite = await createInvite(groupId);
  await sendEmail(
    email,
    "You have been invited to join a group",
    <InviteEmail group={group} token={invite.token} />
  );
}

export async function acceptInviteUseCase(
  authenticatedUser: UserSession,
  { token }: { token: string },
  db = getDB()
) {
  const invite = await getInvite(token, db);

  if (!invite) {
    throw new PublicError("This invite does not exist or has expired");
  }

  if (invite.tokenExpiresAt! < new Date()) {
    throw new PublicError("This invite has expired");
  }

  await addMembership(authenticatedUser.id, invite.groupId, db);
  await deleteInvite(token, db);

  return invite.groupId;
}
