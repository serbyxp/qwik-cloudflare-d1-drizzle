import { sqliteTable, text } from "drizzle-orm/sqlite-core";
//
import { userTable } from "~/database/schema";

export const accountTypeEnum = ["email", "google", "github"] as const;

export const accountsTable = sqliteTable("accounts", {
  id: text("id").primaryKey().$defaultFn(crypto.randomUUID),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  accountType: text("account_type", { enum: accountTypeEnum }).notNull(),
  githubId: text("github_id").unique(),
  googleId: text("google_id").unique(),
  password: text("password"),
  salt: text("salt"),
});
