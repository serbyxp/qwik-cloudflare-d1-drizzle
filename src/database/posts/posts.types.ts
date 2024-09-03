import type { postsTable } from "./posts.schema";

export type Post = typeof postsTable.$inferSelect;
export type NewPost = typeof postsTable.$inferInsert;

export type PostId = Post["id"];
