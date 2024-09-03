import type { groupsTable } from "./groups.schema";

export type Group = typeof groupsTable.$inferSelect;
export type NewGroup = typeof groupsTable.$inferInsert;

export type GroupId = Group["id"];
