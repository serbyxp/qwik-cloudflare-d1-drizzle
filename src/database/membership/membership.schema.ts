import { relations } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
//
import { userTable, groupsTable, profilesTable } from "~/database/schema";

export const roleEnum = ["user", "member", "admin"] as const;

export const membershipsTable = sqliteTable("membership", {
  id: text("id").primaryKey().$defaultFn(crypto.randomUUID),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  groupId: text("group_id")
    .notNull()
    .references(() => groupsTable.id, { onDelete: "cascade" }),
  role: text("role", { enum: roleEnum }).notNull().default("user"),
});

// Relations
export const membershipRelations = relations(membershipsTable, ({ one }) => ({
  user: one(userTable, {
    fields: [membershipsTable.userId],
    references: [userTable.id],
  }),
  profile: one(profilesTable, {
    fields: [membershipsTable.userId],
    references: [profilesTable.userId],
  }),
  group: one(groupsTable, {
    fields: [membershipsTable.groupId],
    references: [groupsTable.id],
  }),
}));
