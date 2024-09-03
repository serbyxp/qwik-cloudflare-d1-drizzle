import type { repliesTable } from "./replies.schema";

export type Reply = typeof repliesTable.$inferSelect;
export type NewReply = typeof repliesTable.$inferInsert;

export type ReplyId = Reply["id"];
