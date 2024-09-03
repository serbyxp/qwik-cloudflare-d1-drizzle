import { eq } from "drizzle-orm";
//
import type { UserId } from "~/database";
import { getDB } from "~/database";
import { sessionTable } from "./sessions.schema";

export async function deleteSessionForUser(userId: UserId, trx = getDB()) {
  await trx.delete(sessionTable).where(eq(sessionTable.userId, userId));
}
