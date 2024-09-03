import type { Subscription } from "~/database";

export function isSubscriptionActive(subscription?: Subscription) {
  if (!subscription) return false;
  return subscription.stripeCurrentPeriodEnd >= new Date();
}
