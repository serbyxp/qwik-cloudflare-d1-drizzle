import type { followingTable } from "./following.schema";

export type Following = typeof followingTable.$inferSelect;
export type NewFollowing = typeof followingTable.$inferInsert;

export type FollowingId = Following["id"];
