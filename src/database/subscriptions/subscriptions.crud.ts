import { eq } from "drizzle-orm";
//
import type { UserId } from "~/database";
import { getDB } from "~/database";
import { subscriptionsTable } from "./subscriptions.schema";
import type { SubscriptionId } from "./subscriptions.types";

export async function createSubscription(
  subscription: {
    userId: UserId;
    stripeSubscriptionId: string;
    stripeCustomerId: string;
    stripePriceId: string;
    stripeCurrentPeriodEnd: Date;
  },
  db = getDB()
) {
  await db.insert(subscriptionsTable).values(subscription);
}

export async function updateSubscription(
  subscription: {
    stripeSubscriptionId: SubscriptionId;
    stripePriceId: string;
    stripeCurrentPeriodEnd: Date;
  },
  db = getDB()
) {
  await db
    .update(subscriptionsTable)
    .set({
      stripePriceId: subscription.stripePriceId,
      stripeCurrentPeriodEnd: subscription.stripeCurrentPeriodEnd,
    })
    .where(
      eq(
        subscriptionsTable.stripeSubscriptionId,
        subscription.stripeSubscriptionId
      )
    );
}

export async function getSubscription(userId: UserId, db = getDB()) {
  return await db.query.subscriptionsTable.findFirst({
    where: (subscriptions, { eq }) => eq(subscriptions.userId, userId),
  });
}
