import { eq } from "drizzle-orm";
import crypto from "crypto";
//
import { getDB, getAccountByUserId, accountsTable } from "~/database";
import { userTable } from "./users.schema";
import type { UserId, User } from "./users.types";

const ITERATIONS = 10000;

export async function deleteUser(userId: UserId, db = getDB()) {
  await db.delete(userTable).where(eq(userTable.id, userId));
}

export async function getUser(userId: UserId, db = getDB()) {
  const user = await db.query.userTable.findFirst({
    where: eq(userTable.id, userId),
  });

  return user;
}

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

export async function createUser(email: string, db = getDB()) {
  const [user] = await db
    .insert(userTable)
    .values({
      email,
      joined: new Date(),
    })
    .returning();
  return user;
}

export async function createMagicUser(email: string, db = getDB()) {
  const [user] = await db
    .insert(userTable)
    .values({
      email,
      emailVerified: new Date(),
      joined: new Date(),
    })
    .returning();

  await db
    .insert(accountsTable)
    .values({
      userId: user.id,
      accountType: "email",
    })
    .returning();

  return user;
}

export async function verifyPassword(
  email: string,
  plainTextPassword: string,
  db = getDB()
) {
  const user = await getUserByEmail(email, db);

  if (!user) {
    return false;
  }

  const account = await getAccountByUserId(user.id, db);

  if (!account) {
    return false;
  }

  const salt = account.salt;
  const savedPassword = account.password;

  if (!salt || !savedPassword) {
    return false;
  }

  const hash = await hashPassword(plainTextPassword, salt);
  return account.password == hash;
}

export async function getUserByEmail(email: string, db = getDB()) {
  const user = await db.query.userTable.findFirst({
    where: eq(userTable.email, email),
  });

  return user;
}

export async function getMagicUserAccountByEmail(email: string, db = getDB()) {
  const user = await db.query.userTable.findFirst({
    where: eq(userTable.email, email),
  });

  return user;
}

export async function setEmailVerified(userId: UserId, db = getDB()) {
  await db
    .update(userTable)
    .set({
      emailVerified: new Date(),
    })
    .where(eq(userTable.id, userId));
}

export async function updateUser(
  userId: UserId,
  updatedUser: Partial<User>,
  db = getDB()
) {
  await db.update(userTable).set(updatedUser).where(eq(userTable.id, userId));
}
