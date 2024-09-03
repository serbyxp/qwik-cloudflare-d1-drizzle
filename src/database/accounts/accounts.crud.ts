import { and, eq } from "drizzle-orm";
import crypto from "crypto";
//
import type { UserId } from "~/database";
import { getDB } from "~/database";
import { accountsTable } from "./accounts.schema";

const ITERATIONS = 10000;

async function hashPassword(plainTextPassword: string, salt: string) {
  return new Promise<string>((resolve, reject) => {
    crypto.pbkdf2(
      plainTextPassword,
      salt,
      ITERATIONS,
      64,
      "sha512",
      (err, derivedKey) => {
        if (err) reject(err);
        resolve(derivedKey.toString("hex"));
      }
    );
  });
}

// export async function createAccount(user: User) {
//   await database.insert(accountsTable).values({
//     providerId: "email",
//     providerAccountId: "email",
//     type: "email",
//     userId: user.id,
//     access_token: "",
//   });
// }

export async function createAccount(
  userId: UserId,
  password: string,
  db = getDB()
) {
  const salt = crypto.randomBytes(128).toString("base64");
  const hash = await hashPassword(password, salt);
  const [account] = await db
    .insert(accountsTable)
    .values({
      userId,
      accountType: "email",
      password: hash,
      salt,
    })
    .returning();
  return account;
}

export async function createAccountViaGithub(
  userId: UserId,
  githubId: string,
  db = getDB()
) {
  await db
    .insert(accountsTable)
    .values({
      userId: userId,
      accountType: "github",
      githubId,
    })
    .onConflictDoNothing()
    .returning();
}

export async function createAccountViaGoogle(
  userId: UserId,
  googleId: string,
  db = getDB()
) {
  await db
    .insert(accountsTable)
    .values({
      userId: userId,
      accountType: "google",
      googleId,
    })
    .onConflictDoNothing()
    .returning();
}

export async function getAccountByUserId(userId: UserId, db = getDB()) {
  const account = await db.query.accountsTable.findFirst({
    where: eq(accountsTable.userId, userId),
  });

  return account;
}

export async function updatePassword(
  userId: UserId,
  password: string,
  trx = getDB()
) {
  const salt = crypto.randomBytes(128).toString("base64");
  const hash = await hashPassword(password, salt);
  await trx
    .update(accountsTable)
    .set({
      password: hash,
      salt,
    })
    .where(
      and(
        eq(accountsTable.userId, userId),
        eq(accountsTable.accountType, "email")
      )
    );
}

export async function getAccountByGoogleId(googleId: string, db = getDB()) {
  return await db.query.accountsTable.findFirst({
    where: eq(accountsTable.googleId, googleId),
  });
}

export async function getAccountByGithubId(githubId: string, db = getDB()) {
  return await db.query.accountsTable.findFirst({
    where: eq(accountsTable.githubId, githubId),
  });
}
