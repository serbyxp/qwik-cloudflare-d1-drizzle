import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
//
import { groupsTable } from "~/database/schema";

export const eventsTable = sqliteTable("events", {
  id: text("id").primaryKey().$defaultFn(crypto.randomUUID),
  groupId: text("group_id")
    .notNull()
    .references(() => groupsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageId: text("image_id"),

  startsAt: integer("starts_at", {
    mode: "timestamp_ms",
  }).notNull(),
  endsAt: integer("starts_at", {
    mode: "timestamp_ms",
  }).notNull(),
});
