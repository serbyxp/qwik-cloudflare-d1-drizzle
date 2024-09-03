/** @jsxImportSource react */
import { uniqueNamesGenerator, colors, animals } from "unique-names-generator";
//
import {
  MAX_UPLOAD_IMAGE_SIZE,
  MAX_UPLOAD_IMAGE_SIZE_IN_MB,
  applicationName,
} from "~/app-config";
import type { UserId, UserSession } from "~/database";
import {
  createUser,
  createTransaction,
  deleteUser,
  getUserByEmail,
  updateUser,
  verifyPassword,
  getDB,
} from "~/database";
import {
  createAccount,
  createAccountViaGithub,
  createAccountViaGoogle,
  updatePassword,
} from "~/database/accounts";
import {
  getNotificationsForUser,
  getTop3UnreadNotificationsForUser,
} from "~/database/notifications";
import { createProfile, getProfile, updateProfile } from "~/database/profiles";
import {
  createPasswordResetToken,
  deletePasswordResetToken,
  getPasswordResetToken,
} from "~/database/reset-tokens";
import { deleteSessionForUser } from "~/database/sessions";
import {
  createVerifyEmailToken,
  deleteVerifyEmailToken,
  getVerifyEmailToken,
} from "~/database/verify-email";
import { ResetPasswordEmail } from "~/emails/reset-password";
import { VerifyEmail } from "~/emails/verify-email";
import { getFileUrl, uploadFileToBucket } from "~/lib/files";
import { sendEmail } from "~/lib/send-email";
import type { GoogleUser } from "~/routes/api/login/google/callback/index";
import type { GitHubUser } from "~/routes/api/login/github/callback/index";
import { createUUID } from "~/utils";
import { LoginError, PublicError } from "./errors";

export async function deleteUserUseCase(
  authenticatedUser: UserSession,
  userToDeleteId: UserId
): Promise<void> {
  if (authenticatedUser.id !== userToDeleteId) {
    throw new PublicError("You can only delete your own account");
  }

  await deleteUser(userToDeleteId);
}

export async function getUserProfileUseCase(userId: UserId) {
  const profile = await getProfile(userId);

  if (!profile) {
    throw new PublicError("User not found");
  }

  return profile;
}

export async function registerUserUseCase(
  email: string,
  password: string,
  db = getDB()
) {
  const existingUser = await getUserByEmail(email, db);
  if (existingUser) {
    throw new PublicError("An user with that email already exists.");
  }
  const user = await createUser(email, db);
  await createAccount(user.id, password);

  const displayName = uniqueNamesGenerator({
    dictionaries: [colors, animals],
    separator: " ",
    style: "capital",
  });
  await createProfile(user.id, displayName, undefined, db);

  const token = await createVerifyEmailToken(user.id);
  await sendEmail(
    email,
    `Verify your email for ${applicationName}`,
    <VerifyEmail token={token} />
  );

  return { id: user.id };
}

export async function signInUseCase(email: string, password: string) {
  const user = await getUserByEmail(email);

  if (!user) {
    throw new LoginError();
  }

  const isPasswordCorrect = await verifyPassword(email, password);

  if (!isPasswordCorrect) {
    throw new LoginError();
  }

  return { id: user.id };
}

export function getProfileImageKey(userId: UserId, imageId: string) {
  return `users/${userId}/images/${imageId}`;
}

export async function updateProfileImageUseCase(file: File, userId: UserId) {
  if (!file.type.startsWith("image/")) {
    throw new PublicError("File should be an image.");
  }

  if (file.size > MAX_UPLOAD_IMAGE_SIZE) {
    throw new PublicError(
      `File size should be less than ${MAX_UPLOAD_IMAGE_SIZE_IN_MB}MB.`
    );
  }

  const imageId = createUUID();

  await uploadFileToBucket(file, getProfileImageKey(userId, imageId));
  await updateProfile(userId, { imageId });
}

export function getProfileImageUrl(userId: UserId, imageId?: string) {
  return `${import.meta.env.BASE_URL}/api/users/${userId}/images/${imageId ?? "default"}`;
}

export function getDefaultImage(userId: UserId) {
  return `${import.meta.env.BASE_URL}/api/users/${userId}/images/default`;
}

export async function getProfileImageUrlUseCase({
  userId,
  imageId,
}: {
  userId: UserId;
  imageId: string;
}) {
  const url = await getFileUrl({
    key: getProfileImageKey(userId, imageId),
  });

  return url;
}

export async function updateProfileBioUseCase(userId: UserId, bio: string) {
  await updateProfile(userId, { bio });
}

export async function updateProfileNameUseCase(
  userId: UserId,
  displayName: string
) {
  await updateProfile(userId, { displayName });
}

export async function createGithubUserUseCase(
  githubUser: GitHubUser,
  db = getDB()
) {
  let existingUser = await getUserByEmail(githubUser.email, db);

  if (!existingUser) {
    existingUser = await createUser(githubUser.email, db);
  }

  await createAccountViaGithub(existingUser.id, githubUser.id, db);

  await createProfile(
    existingUser.id,
    githubUser.login,
    githubUser.avatar_url,
    db
  );

  return existingUser.id;
}

export async function createGoogleUserUseCase(
  googleUser: GoogleUser,
  db = getDB()
) {
  let existingUser = await getUserByEmail(googleUser.email, db);

  if (!existingUser) {
    existingUser = await createUser(googleUser.email, db);
  }

  await createAccountViaGoogle(existingUser.id, googleUser.sub, db);

  await createProfile(existingUser.id, googleUser.name, googleUser.picture, db);

  return existingUser.id;
}

export async function resetPasswordUseCase(email: string, db = getDB()) {
  const user = await getUserByEmail(email, db);

  if (!user) {
    return null;
  }

  const token = await createPasswordResetToken(user.id, db);

  await sendEmail(
    email,
    `Your password reset link for ${applicationName}`,
    <ResetPasswordEmail token={token} />
  );
}

export async function changePasswordUseCase(token: string, password: string) {
  const tokenEntry = await getPasswordResetToken(token);

  if (!tokenEntry) {
    throw new PublicError("Invalid token");
  }

  const userId = tokenEntry.userId;

  await createTransaction(async (trx) => {
    await deletePasswordResetToken(token, trx);
    await updatePassword(userId, password, trx);
    await deleteSessionForUser(userId, trx);
  });
}

export async function verifyEmailUseCase(token: string, db = getDB()) {
  const tokenEntry = await getVerifyEmailToken(token, db);

  if (!tokenEntry) {
    throw new PublicError("Invalid token");
  }

  const userId = tokenEntry.userId;

  await updateUser(userId, { emailVerified: new Date() }, db);
  await deleteVerifyEmailToken(token, db);
  return userId;
}

export async function getUnreadNotificationsForUserUseCase(userId: UserId) {
  return await getTop3UnreadNotificationsForUser(userId);
}

export async function getNotificationsForUserUseCase(userId: UserId) {
  const notifications = await getNotificationsForUser(userId);
  notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return notifications;
}
