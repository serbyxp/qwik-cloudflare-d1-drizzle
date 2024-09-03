import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const magicLinksTable = sqliteTable("magic_links", {
  id: text("id").primaryKey().$defaultFn(crypto.randomUUID),
  email: text("email").notNull().unique(),
  token: text("token"),
  tokenExpiresAt: integer("token_expires_at", {
    mode: "timestamp_ms",
  }).notNull(),
});
