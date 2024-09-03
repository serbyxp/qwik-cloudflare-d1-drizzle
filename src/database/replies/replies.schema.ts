import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
//
import { userTable, postsTable, groupsTable } from "~/database/schema";

export const repliesTable = sqliteTable("replies", {
  id: text("id").primaryKey().$defaultFn(crypto.randomUUID),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  postId: text("post_id")
    .notNull()
    .references(() => postsTable.id, { onDelete: "cascade" }),
  groupId: text("group_id")
    .notNull()
    .references(() => groupsTable.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  createdAt: integer("created_at", {
    mode: "timestamp_ms",
  }),
});
