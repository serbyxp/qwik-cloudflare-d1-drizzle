import Stripe from "stripe";

export const stripe = new Stripe(import.meta.env.STRIPE_API_KEY, {
  apiVersion: "2024-06-20",
  typescript: true,
});
