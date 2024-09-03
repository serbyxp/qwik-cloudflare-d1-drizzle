/** @jsxImportSource react */
import { animals, colors, uniqueNamesGenerator } from "unique-names-generator";
//
import { applicationName } from "~/app-config";
import { getDB } from "~/database";
import {
  deleteMagicToken,
  getMagicLinkByToken,
  upsertMagicLink,
} from "~/database/magic-links";
import { createProfile } from "~/database/profiles";
import {
  createMagicUser,
  getUserByEmail,
  setEmailVerified,
} from "~/database/users";
import { MagicLinkEmail } from "~/emails/magic-link";
import { sendEmail } from "~/lib/send-email";
import { PublicError } from "./errors";

export async function sendMagicLinkUseCase(email: string) {
  const token = await upsertMagicLink(email);

  await sendEmail(
    email,
    `Your magic login link for ${applicationName}`,
    <MagicLinkEmail token={token} />
  );
}

export async function loginWithMagicLinkUseCase(token: string, db = getDB()) {
  const magicLinkInfo = await getMagicLinkByToken(token);

  if (!magicLinkInfo) {
    throw new PublicError("Invalid or expired magic link");
  }

  if (magicLinkInfo.tokenExpiresAt! < new Date()) {
    throw new PublicError("This magic link has expired");
  }

  const existingUser = await getUserByEmail(magicLinkInfo.email);

  if (existingUser) {
    await setEmailVerified(existingUser.id, db);
    await deleteMagicToken(token, db);
    return existingUser;
  } else {
    const newUser = await createMagicUser(magicLinkInfo.email, db);
    const displayName = uniqueNamesGenerator({
      dictionaries: [colors, animals],
      separator: " ",
      style: "capital",
    });
    await createProfile(newUser.id, displayName, undefined, db);
    await deleteMagicToken(token, db);
    return newUser;
  }
}
