import { sqliteTable, text } from "drizzle-orm/sqlite-core";
//
import { userTable } from "~/database/schema";

export const profilesTable = sqliteTable("profile", {
  id: text("id").primaryKey().$defaultFn(crypto.randomUUID),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" })
    .unique(),
  displayName: text("display_name"),
  imageId: text("image_id"),
  image: text("image"),
  bio: text("bio").notNull().default(""),
});
