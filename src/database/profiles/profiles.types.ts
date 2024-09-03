import type { UserId } from "~/database";
import type { profilesTable } from "./profiles.schema";

export type Profile = typeof profilesTable.$inferSelect;
export type NewProfile = typeof profilesTable.$inferInsert;

export type ProfileId = Profile["id"];

export type UserProfile = {
  id: UserId;
  name: string | null;
  image: string | null;
};
