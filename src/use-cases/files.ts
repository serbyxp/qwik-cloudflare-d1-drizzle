import {
  MAX_UPLOAD_IMAGE_SIZE,
  MAX_UPLOAD_IMAGE_SIZE_IN_MB,
} from "~/app-config";
import type { GroupId, UserSession } from "~/database";
import { updateGroup } from "~/database/groups";
import {
  getFileUrl,
  getPresignedPostUrl,
  uploadFileToBucket,
} from "~/lib/files";
import {
  assertAdminOrOwnerOfGroup,
  assertGroupVisible,
} from "~/use-cases/authorization";
import { createUUID } from "~/utils/uuid";
import { PublicError } from "./errors";

export async function getGroupImageUploadUrlUseCase(
  authenticatedUser: UserSession,
  { groupId, contentType }: { groupId: GroupId; contentType: string }
) {
  await assertAdminOrOwnerOfGroup(authenticatedUser, groupId);
  const fileName = `${groupId}-image`;
  return getPresignedPostUrl(fileName, contentType);
}

export async function updateGroupImageUseCase(
  authenticatedUser: UserSession,
  { groupId, file }: { groupId: GroupId; file: File }
) {
  if (!file.type.startsWith("image/")) {
    throw new PublicError("File should be an image.");
  }

  if (file.size > MAX_UPLOAD_IMAGE_SIZE) {
    throw new PublicError(
      `File size should be less than ${MAX_UPLOAD_IMAGE_SIZE_IN_MB}MB.`
    );
  }

  await assertAdminOrOwnerOfGroup(authenticatedUser, groupId);

  const imageId = createUUID();

  await updateGroup(groupId, { bannerId: imageId });
  await uploadFileToBucket(file, getGroupImageKey(groupId, imageId));
}

export function getGroupImageKey(groupId: GroupId, imageId: string) {
  return `groups/${groupId}/images/${imageId}`;
}

export async function getGroupImageUrlUseCase(
  authenticatedUser: UserSession | undefined,
  { groupId, imageId }: { groupId: GroupId; imageId: string }
) {
  await assertGroupVisible(authenticatedUser, groupId);

  const url = await getFileUrl({
    key: getGroupImageKey(groupId, imageId),
  });

  return url;
}
