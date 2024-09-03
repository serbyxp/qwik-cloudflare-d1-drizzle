import { count, eq } from "drizzle-orm";
//
import type { PostId } from "~/database";
import { getDB } from "~/database";
import { repliesTable } from "./replies.schema";
import type { NewReply, Reply, ReplyId } from "./replies.types";

export async function getReplyCountOnPost(postId: PostId, db = getDB()) {
  const [{ count: total }] = await db
    .select({ count: count() })
    .from(repliesTable)
    .where(eq(repliesTable.postId, postId));
  return total;
}

export async function getRepliesOnPost(postId: PostId, db = getDB()) {
  const posts = await db.query.repliesTable.findMany({
    where: eq(repliesTable.postId, postId),
  });
  return posts;
}

export async function createReply(newReply: NewReply, db = getDB()) {
  const [createdReply] = await db
    .insert(repliesTable)
    .values(newReply)
    .returning();
  return createdReply;
}

export async function getReplyById(replyId: ReplyId, db = getDB()) {
  return await db.query.repliesTable.findFirst({
    where: eq(repliesTable.id, replyId),
  });
}

export async function deleteReply(replyId: ReplyId, db = getDB()) {
  await db.delete(repliesTable).where(eq(repliesTable.id, replyId));
}

export async function updateReply(
  replyId: ReplyId,
  updateReply: Partial<Reply>,
  db = getDB()
) {
  const [updatedReply] = await db
    .update(repliesTable)
    .set(updateReply)
    .where(eq(repliesTable.id, replyId))
    .returning();

  return updatedReply;
}
