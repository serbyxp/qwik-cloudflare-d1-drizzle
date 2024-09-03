import { relations } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
//
import { profilesTable, userTable } from "~/database/schema";

export const followingTable = sqliteTable("following", {
  id: text("id").primaryKey().$defaultFn(crypto.randomUUID),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  foreignUserId: text("foreign_user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
});

// Relations
export const followingRelationship = relations(followingTable, ({ one }) => ({
  foreignProfile: one(profilesTable, {
    fields: [followingTable.foreignUserId],
    references: [profilesTable.userId],
  }),
  userProfile: one(profilesTable, {
    fields: [followingTable.userId],
    references: [profilesTable.userId],
  }),
}));
