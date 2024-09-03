import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
//
import { userTable } from "~/database/schema";

export const verifyEmailTokensTable = sqliteTable("verify_email_tokens", {
  id: text("id").primaryKey().$defaultFn(crypto.randomUUID),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" })
    .unique(),
  token: text("token"),
  tokenExpiresAt: integer("token_expires_at", {
    mode: "timestamp_ms",
  }).notNull(),
});
