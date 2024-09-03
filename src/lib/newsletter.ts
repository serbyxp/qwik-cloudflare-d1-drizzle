import { Resend } from "resend";

const resend = new Resend(import.meta.env.EMAIL_SERVER_PASSWORD);

export async function subscribeEmail(email: string) {
  const { error } = await resend.contacts.create({
    email,
    unsubscribed: false,
    audienceId: import.meta.env.RESEND_AUDIENCE_ID,
  });
  if (error) {
    console.error(error);
    throw error;
  }
}
