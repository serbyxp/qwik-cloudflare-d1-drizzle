import type { invitesTable } from "./invites.schema";

export type Invite = typeof invitesTable.$inferSelect;
export type NewInvite = typeof invitesTable.$inferInsert;

export type InviteId = Invite["id"];
