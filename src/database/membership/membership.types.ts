import type { UserId } from "~/database";
import type { membershipsTable, roleEnum } from "./membership.schema";

export type Membership = typeof membershipsTable.$inferSelect;
export type NewMembership = typeof membershipsTable.$inferInsert;

export type MemberRole = (typeof roleEnum)[number];
export type MembershipId = Membership["id"];

export type Role = "owner" | "admin" | "member" | "user";
export type MemberInfo = {
  name: string | null;
  userId: UserId;
  image: string | null;
  role: Role;
};
