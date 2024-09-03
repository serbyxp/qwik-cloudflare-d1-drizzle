import type { PostId, ReplyId, UserSession } from "~/database";
import { getPostById } from "~/database/posts";
import {
  createReply,
  deleteReply,
  getRepliesOnPost,
  getReplyById,
  getReplyCountOnPost,
  updateReply,
} from "~/database/replies";
import { createNotification } from "~/database/notifications";
import { hasAccessToGroup, isAdminOrOwnerOfGroup } from "./authorization";
import { PublicError } from "./errors";

export async function getReplyCountUseCase(
  authenticatedUser: UserSession | undefined,
  postId: PostId
) {
  const replyCount = await getReplyCountOnPost(postId);
  return replyCount;
}

export async function getRepliesForPostUseCase(
  authenticatedUser: UserSession | undefined,
  postId: PostId
) {
  const post = await getPostById(postId);

  if (!post) {
    throw new PublicError("Post not found");
  }

  const hasAccess = await hasAccessToGroup(authenticatedUser, post.groupId);

  if (!hasAccess) {
    throw new PublicError("User does not have access to this group");
  }

  const replies = await getRepliesOnPost(postId);

  return replies;
}

export async function createReplyUseCase(
  authenticatedUser: UserSession,
  reply: { postId: PostId; message: string }
) {
  const post = await getPostById(reply.postId);

  if (!post) {
    throw new PublicError("Post not found");
  }

  const hasAccess = await hasAccessToGroup(authenticatedUser, post.groupId);

  if (!hasAccess) {
    throw new PublicError("You do not have permission to reply to this post");
  }

  const createdReply = await createReply({
    postId: reply.postId,
    message: reply.message,
    groupId: post.groupId,
    userId: authenticatedUser.id,
    createdAt: new Date(),
  });

  if (post.userId !== authenticatedUser.id) {
    await createNotification({
      userId: post.userId,
      groupId: post.groupId,
      postId: post.id,
      type: "reply",
      message: `Someone replied to your post titled ${post.title}.`,
      createdAt: new Date(),
    });
  }

  return createdReply;
}

export async function deleteReplyUseCase(
  authenticatedUser: UserSession,
  reply: { replyId: ReplyId }
) {
  const replyToDelete = await getReplyById(reply.replyId);

  if (!replyToDelete) {
    throw new PublicError("Reply not found");
  }

  const post = await getPostById(replyToDelete.postId);

  if (!post) {
    throw new PublicError("Post not found");
  }

  const hasAccess = await isAdminOrOwnerOfGroup(
    authenticatedUser,
    post.groupId
  );

  if (!hasAccess && replyToDelete.userId !== authenticatedUser.id) {
    throw new PublicError("User does not have permission to delete this reply");
  }

  await deleteReply(reply.replyId);
}

export async function updateReplyUseCase(
  authenticatedUser: UserSession,
  reply: {
    replyId: ReplyId;
    message: string;
  }
) {
  const replyAccess = await hasAccessToMutateReply(
    authenticatedUser,
    reply.replyId
  );

  if (!replyAccess) {
    throw new PublicError("User does not have access to this reply");
  }

  const updatedReply = await updateReply(reply.replyId, {
    message: reply.message,
  });

  return updatedReply;
}

export async function hasAccessToMutateReply(
  authenticatedUser: UserSession | undefined,
  replyId: ReplyId
) {
  if (!authenticatedUser) return false;

  const replyToUpdate = await getReplyById(replyId);

  if (!replyToUpdate) {
    return null;
  }

  const post = await getPostById(replyToUpdate.postId);

  if (!post) {
    return null;
  }

  const hasAccess = await isAdminOrOwnerOfGroup(
    authenticatedUser,
    post.groupId
  );

  if (!hasAccess && replyToUpdate.userId !== authenticatedUser.id) {
    return null;
  }

  return {
    reply: replyToUpdate,
    post,
  };
}

export async function hasAccessToMutateReplyUseCase(
  authenticatedUser: UserSession | undefined,
  replyId: ReplyId
) {
  const replyAccess = await hasAccessToMutateReply(authenticatedUser, replyId);
  return replyAccess;
}
