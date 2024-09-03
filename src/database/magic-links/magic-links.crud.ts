import { eq } from "drizzle-orm";
//
import { TOKEN_LENGTH, TOKEN_TTL } from "~/app-config";
import { getDB, generateRandomToken } from "~/database";
import { magicLinksTable } from "./magic-links.schema";

export async function upsertMagicLink(email: string, db = getDB()) {
  const token = await generateRandomToken(TOKEN_LENGTH);
  const tokenExpiresAt = new Date(Date.now() + TOKEN_TTL);

  await db
    .insert(magicLinksTable)
    .values({
      email,
      token,
      tokenExpiresAt,
    })
    .onConflictDoUpdate({
      target: magicLinksTable.email,
      set: {
        token,
        tokenExpiresAt,
      },
    });

  return token;
}

export async function getMagicLinkByToken(token: string, db = getDB()) {
  const existingToken = await db.query.magicLinksTable.findFirst({
    where: eq(magicLinksTable.token, token),
  });

  return existingToken;
}

export async function deleteMagicToken(token: string, db = getDB()) {
  await db.delete(magicLinksTable).where(eq(magicLinksTable.token, token));
}
