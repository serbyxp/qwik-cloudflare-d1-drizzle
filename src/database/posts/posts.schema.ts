import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
//
import { groupsTable, userTable } from "~/database/schema";

export const postsTable = sqliteTable("posts", {
  id: text("id").primaryKey().$defaultFn(crypto.randomUUID),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  groupId: text("group_id")
    .notNull()
    .references(() => groupsTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  message: text("message").notNull(),
  createdAt: integer("created_at", {
    mode: "timestamp_ms",
  }),
});

// Relations
export const postsRelationships = relations(postsTable, ({ one }) => ({
  user: one(userTable, {
    fields: [postsTable.userId],
    references: [userTable.id],
  }),
  group: one(groupsTable, {
    fields: [postsTable.groupId],
    references: [groupsTable.id],
  }),
}));
