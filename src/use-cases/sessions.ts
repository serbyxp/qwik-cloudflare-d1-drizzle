import type { UserSession } from "~/database/sessions";
import { deleteSessionForUser } from "~/database/sessions";

export async function invalidateSessionsUseCase(user: UserSession) {
  await deleteSessionForUser(user.id);
}
