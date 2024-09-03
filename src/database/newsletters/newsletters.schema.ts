import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const newslettersTable = sqliteTable("newsletter", {
  id: text("id").primaryKey().$defaultFn(crypto.randomUUID),
  email: text("email").notNull().unique(),
});
