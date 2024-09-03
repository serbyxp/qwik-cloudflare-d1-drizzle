import { eq } from "drizzle-orm";
//
import type { UserId } from "~/database";
import { getDB } from "~/database";
import { profilesTable } from "./profiles.schema";
import type { Profile } from "./profiles.types";

export async function createProfile(
  userId: UserId,
  displayName: string,
  image?: string,
  db = getDB()
) {
  const [profile] = await db
    .insert(profilesTable)
    .values({
      userId,
      image,
      displayName,
    })
    .onConflictDoNothing()
    .returning();
  return profile;
}

export async function updateProfile(
  userId: UserId,
  updateProfile: Partial<Profile>,
  db = getDB()
) {
  await db
    .update(profilesTable)
    .set(updateProfile)
    .where(eq(profilesTable.userId, userId));
}

export async function getProfile(userId: UserId, db = getDB()) {
  const profile = await db.query.profilesTable.findFirst({
    where: eq(profilesTable.userId, userId),
  });

  return profile;
}
