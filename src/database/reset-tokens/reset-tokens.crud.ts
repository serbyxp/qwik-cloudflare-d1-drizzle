import { eq } from "drizzle-orm";
//
import { TOKEN_LENGTH, TOKEN_TTL } from "~/app-config";
import type { UserId } from "~/database";
import { getDB, generateRandomToken } from "~/database";
import { resetTokensTable } from "./reset-tokens.schema";

export async function createPasswordResetToken(userId: UserId, db = getDB()) {
  const token = await generateRandomToken(TOKEN_LENGTH);
  const tokenExpiresAt = new Date(Date.now() + TOKEN_TTL);

  await db
    .insert(resetTokensTable)
    .values({
      userId,
      token,
      tokenExpiresAt,
    })
    .onConflictDoUpdate({
      target: resetTokensTable.userId,
      set: {
        token,
        tokenExpiresAt,
      },
    });

  return token;
}

export async function getPasswordResetToken(token: string, db = getDB()) {
  const existingToken = await db.query.resetTokensTable.findFirst({
    where: eq(resetTokensTable.token, token),
  });

  return existingToken;
}

export async function deletePasswordResetToken(token: string, trx = getDB()) {
  await trx.delete(resetTokensTable).where(eq(resetTokensTable.token, token));
}
