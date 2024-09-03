import { eq } from "drizzle-orm";
//
import { TOKEN_LENGTH, TOKEN_TTL } from "~/app-config";
import type { UserId } from "~/database";
import { getDB, generateRandomToken } from "~/database";
import { verifyEmailTokensTable } from "./verify-email.schema";

export async function createVerifyEmailToken(userId: UserId, db = getDB()) {
  const token = await generateRandomToken(TOKEN_LENGTH);
  const tokenExpiresAt = new Date(Date.now() + TOKEN_TTL);

  await db
    .insert(verifyEmailTokensTable)
    .values({
      userId,
      token,
      tokenExpiresAt,
    })
    .onConflictDoUpdate({
      target: verifyEmailTokensTable.id,
      set: {
        token,
        tokenExpiresAt,
      },
    });

  return token;
}

export async function getVerifyEmailToken(token: string, db = getDB()) {
  const existingToken = await db.query.verifyEmailTokensTable.findFirst({
    where: eq(verifyEmailTokensTable.token, token),
  });

  return existingToken;
}

export async function deleteVerifyEmailToken(token: string, db = getDB()) {
  await db
    .delete(verifyEmailTokensTable)
    .where(eq(verifyEmailTokensTable.token, token));
}
