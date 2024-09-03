import type { newslettersTable } from "./newsletters.schema";

export type NewsLetter = typeof newslettersTable.$inferSelect;
export type NewNewsLetter = typeof newslettersTable.$inferInsert;

export type NewNewsLetterId = NewsLetter["id"];
