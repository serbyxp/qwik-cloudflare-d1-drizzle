// src/schema.ts
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const linkShare = sqliteTable("linkShare", {
  id: text("id").primaryKey().$defaultFn(crypto.randomUUID),
  url: text("url").notNull(),
  title: text("title").notNull(),
  remark: text("remark"),
  created: integer("created", {
    mode: "timestamp_ms",
  })
    .notNull()
    .$defaultFn(() => new Date()),
  modified: integer("modified", {
    mode: "timestamp_ms",
  })
    .notNull()
    .$defaultFn(() => new Date()),
  deleted: integer("deleted", {
    mode: "timestamp_ms",
  }),
});
