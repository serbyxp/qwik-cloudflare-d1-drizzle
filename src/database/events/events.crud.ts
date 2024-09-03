import { asc, eq } from "drizzle-orm";
//
import type { GroupId } from "~/database";
import { getDB } from "~/database";
import { eventsTable } from "./events.schema";
import type { Event, NewEvent } from "./events.types";

export async function createEvent(
  newEvent: {
    groupId: GroupId;
    name: string;
    description: string;
    startsAt: Date;
    endsAt: Date;
  },
  db = getDB()
) {
  const [event] = await db.insert(eventsTable).values(newEvent).returning();
  return event;
}

export async function getEvent(eventId: Event["id"], db = getDB()) {
  return await db.query.eventsTable.findFirst({
    where: eq(eventsTable.id, eventId),
  });
}

export async function getEventsByGroupId(groupId: GroupId, db = getDB()) {
  return await db.query.eventsTable.findMany({
    where: eq(eventsTable.groupId, groupId),
    orderBy: [asc(eventsTable.startsAt)],
  });
}

export async function updateEvent(
  eventId: Event["id"],
  updatedEvent: Partial<NewEvent>,
  db = getDB()
) {
  await db
    .update(eventsTable)
    .set(updatedEvent)
    .where(eq(eventsTable.id, eventId));
}

export async function deleteEvent(eventId: Event["id"], db = getDB()) {
  await db.delete(eventsTable).where(eq(eventsTable.id, eventId));
}
