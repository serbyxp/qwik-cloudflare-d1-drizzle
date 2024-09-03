import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
//
import { membershipsTable, userTable } from "~/database/schema";

export const groupsTable = sqliteTable("group", {
  id: text("id").primaryKey().$defaultFn(crypto.randomUUID),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  isPublic: integer("is_public", { mode: "boolean" }).notNull().default(false),
  bannerId: text("banner_id"),
  info: text("info").default(""),
  youtubeLink: text("youtube_link").default(""),
  discordLink: text("discord_link").default(""),
  githubLink: text("github_link").default(""),
  xLink: text("x_link").default(""),
});

// Relations
export const groupRelations = relations(groupsTable, ({ many }) => ({
  memberships: many(membershipsTable),
}));
