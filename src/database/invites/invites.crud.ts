import { eq } from "drizzle-orm";
//
import type { GroupId } from "~/database";
import { getDB } from "~/database";
import { invitesTable } from "./invites.schema";

export async function getInvite(token: string, db = getDB()) {
  return await db.query.invitesTable.findFirst({
    where: eq(invitesTable.token, token),
  });
}

export async function deleteInvite(token: string, db = getDB()) {
  await db.delete(invitesTable).where(eq(invitesTable.token, token));
}

export async function createInvite(groupId: GroupId, db = getDB()) {
  const [invite] = await db
    .insert(invitesTable)
    .values({
      groupId,
    })
    .returning();
  return invite;
}
