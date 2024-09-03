import { and, eq } from "drizzle-orm";
//
import type { GroupId, UserId } from "~/database";
import { getDB, groupsTable } from "~/database";
import { postsTable } from "./posts.schema";
import type { PostId, NewPost, Post } from "./posts.types";

export async function getPostsInGroup(groupId: GroupId, db = getDB()) {
  return await db.query.postsTable.findMany({
    where: eq(postsTable.groupId, groupId),
    limit: 20,
  });
}

export async function createPost(newPost: NewPost, db = getDB()) {
  return await db.insert(postsTable).values(newPost);
}

export async function deletePost(postId: PostId, db = getDB()) {
  const [post] = await db
    .delete(postsTable)
    .where(eq(postsTable.id, postId))
    .returning();
  return post;
}

export async function getPostById(postId: PostId, db = getDB()) {
  return await db.query.postsTable.findFirst({
    where: eq(postsTable.id, postId),
  });
}

export async function getRecentPublicPostsByUserId(
  userId: UserId,
  db = getDB()
) {
  const results = await db
    .select()
    .from(postsTable)
    .innerJoin(groupsTable, eq(postsTable.groupId, groupsTable.id))
    .where(and(eq(groupsTable.isPublic, true), eq(postsTable.userId, userId)))
    .limit(20);
  return results.map((result) => result.posts);
}

export async function updatePost(
  postId: UserId,
  updatedPost: Partial<Post>,
  db = getDB()
) {
  const [post] = await db
    .update(postsTable)
    .set(updatedPost)
    .where(eq(postsTable.id, postId))
    .returning();
  return post;
}
