import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
//
import { userTable } from "~/database/schema";

export const sessionTable = sqliteTable("session", {
  id: text("id").primaryKey().$defaultFn(crypto.randomUUID),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at", {
    mode: "timestamp_ms",
  }).notNull(),
});
