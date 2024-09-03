/** @jsxImportSource react */
import { Resend } from "resend";
import { ReactNode } from "react";

const resend = new Resend(import.meta.env.EMAIL_SERVER_PASSWORD);

export async function sendEmail(
  email: string,
  subject: string,
  body: ReactNode
) {
  const { error } = await resend.emails.send({
    from: import.meta.env.EMAIL_FROM,
    to: email,
    subject,
    react: <>{body}</>,
  });

  if (error) {
    throw error;
  }
}

// TODO: implement me
// export async function batchSendEmails(
//   emails: {
//     to: string;
//     subject: string;
//     body: ReactNode;
//   }[]
// ) {
//   const { error } = await resend.batch.send(
//     emails.map((email) => ({
//       from: EMAIL_FROM,
//       to: email.to,
//       subject: email.subject,
//       react: email.body,
//     })
//   );
//   if (error) {
//     throw error;
//   }
// }
