import { Cookie } from "@builder.io/qwik-city";
import { UserId } from "lucia";
//
import { lucia, validateRequest } from "~/auth";
import { AuthenticationError } from "~/utils";

export const getCurrentUser = (async (cookie:Cookie) => {
  const session = await validateRequest(cookie);
  if (!session.user) {
    return undefined;
  }
  return session.user;
});

export const assertAuthenticated = async (cookie:Cookie) => {
  const user = await getCurrentUser(cookie);
  if (!user) {
    throw new AuthenticationError();
  }
  return user;
};

export async function setSession(userId: UserId, cookie:Cookie) {
  const session = await lucia.createSession(userId, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookie.set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
}
