import type { eventsTable } from "./events.schema";

export type Event = typeof eventsTable.$inferSelect;
export type NewEvent = typeof eventsTable.$inferInsert;
export type EventId = Event["id"];
