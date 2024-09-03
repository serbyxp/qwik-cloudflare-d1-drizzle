import { saveNewsletterSubscription } from "~/database/newsletters";
import { subscribeEmail } from "~/lib/newsletter";

export async function subscribeEmailUseCase(email: string) {
  await Promise.all([saveNewsletterSubscription(email), subscribeEmail(email)]);
}
