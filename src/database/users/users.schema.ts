import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const userTable = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(crypto.randomUUID),
  email: text("email").unique().notNull(),
  emailVerified: integer("email_verified", { mode: "timestamp_ms" }),

  joined: integer("created", {
    mode: "timestamp_ms",
  }).notNull(),
});
