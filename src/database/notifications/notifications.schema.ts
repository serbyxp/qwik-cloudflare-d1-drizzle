import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
//
import { groupsTable, userTable } from "~/database/schema";

export const notificationsTable = sqliteTable("notifications", {
  id: text("id").primaryKey().$defaultFn(crypto.randomUUID),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  groupId: text("group_id")
    .notNull()
    .references(() => groupsTable.id, { onDelete: "cascade" }),
  postId: text("post_id"),
  isRead: integer("is_read", { mode: "boolean" }).notNull().default(false),
  type: text("type").notNull(),
  message: text("message").notNull(),

  createdAt: integer("created_at", {
    mode: "timestamp_ms",
  }).notNull(),
});
