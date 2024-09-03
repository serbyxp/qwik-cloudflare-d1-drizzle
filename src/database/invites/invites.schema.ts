import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
//
import { groupsTable } from "~/database/schema";

export const invitesTable = sqliteTable("invites", {
  id: text("id").primaryKey().$defaultFn(crypto.randomUUID),
  token: text("token").notNull().$defaultFn(crypto.randomUUID).unique(),
  tokenExpiresAt: integer("token_expires_at", {
    mode: "timestamp_ms",
  }),
  groupId: text("group_id")
    .notNull()
    .references(() => groupsTable.id, { onDelete: "cascade" }),
});
