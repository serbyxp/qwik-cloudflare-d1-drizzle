import { getDB } from "~/database";
import type { GroupId, PostId, UserId, UserSession } from "~/database";
import { getGroupById } from "~/database/groups";
import { isGroupOwnerUseCase, isGroupVisibleToUserUseCase } from "./membership";
import {
  createPost,
  deletePost,
  getPostById,
  getRecentPublicPostsByUserId,
  getPostsInGroup,
  updatePost,
} from "~/database/posts";
import { isAdminOrOwnerOfGroup } from "./authorization";
import { AuthenticationError } from "~/utils/app-util";
import { PublicError } from "./errors";

// TODO: clean up this function
export async function getPostsInGroupUseCase(
  authenticatedUser: UserSession | undefined,
  groupId: GroupId,
  db = getDB()
) {
  const group = await getGroupById(groupId, db);

  if (!group) {
    throw new PublicError("Group not found");
  }

  if (!(await isGroupVisibleToUserUseCase(authenticatedUser, groupId))) {
    throw new AuthenticationError();
  }

  const posts = await getPostsInGroup(groupId, db);
  return posts;
}

export async function getPostByIdUseCase(
  authenticatedUser: UserSession | undefined,
  postId: PostId
) {
  const post = await getPostById(postId);

  if (!post) {
    throw new PublicError("Post not found");
  }

  if (!(await isGroupVisibleToUserUseCase(authenticatedUser, post.groupId))) {
    throw new AuthenticationError();
  }

  return post;
}

export async function createPostUseCase(
  authenticatedUser: UserSession,
  {
    groupId,
    title,
    message,
  }: {
    groupId: GroupId;
    title: string;
    message: string;
  },
  db = getDB()
) {
  const group = await getGroupById(groupId, db);

  if (!group) {
    throw new PublicError("Group not found");
  }

  if (!(await isGroupVisibleToUserUseCase(authenticatedUser, groupId))) {
    throw new AuthenticationError();
  }

  await createPost(
    {
      userId: authenticatedUser.id,
      groupId,
      title,
      message,
      createdAt: new Date(),
    },
    db
  );
}

export async function deletePostUseCase(
  authenticatedUser: UserSession,
  {
    postId,
  }: {
    postId: PostId;
  },
  db = getDB()
) {
  const post = await getPostById(postId, db);

  if (!post) {
    throw new PublicError("Post not found");
  }

  const group = await getGroupById(post.groupId, db);

  if (!group) {
    throw new PublicError("Group not found");
  }

  const isPostOwner = post.userId === authenticatedUser.id;

  if (
    !(await isGroupOwnerUseCase(authenticatedUser, group.id)) &&
    !isPostOwner
  ) {
    throw new AuthenticationError();
  }

  await deletePost(postId, db);

  return post;
}

export async function updatePostUseCase(
  authenticatedUser: UserSession,
  {
    postId,
    message,
    title,
  }: {
    postId: PostId;
    message: string;
    title: string;
  },
  db = getDB()
) {
  const post = await getPostById(postId, db);

  if (!post) {
    throw new PublicError("Post not found");
  }

  const group = await getGroupById(post.groupId, db);

  if (!group) {
    throw new PublicError("Group not found");
  }

  const isPostOwner = post.userId === authenticatedUser.id;

  if (
    !(await isGroupOwnerUseCase(authenticatedUser, group.id)) &&
    !isPostOwner
  ) {
    throw new AuthenticationError();
  }

  const updatedPost = await updatePost(
    postId,
    {
      message,
      title,
    },
    db
  );

  return updatedPost;
}

export async function canEditPostUseCase(
  authenticatedUser: UserSession | undefined,
  postId: PostId
) {
  if (!authenticatedUser) return false;

  const post = await getPostById(postId);

  if (!post) {
    return false;
  }

  return (
    (await isAdminOrOwnerOfGroup(authenticatedUser, post.groupId)) ||
    post.userId === authenticatedUser.id
  );
}

export async function getPublicPostsByUserUseCase(userId: UserId) {
  const posts = await getRecentPublicPostsByUserId(userId);
  return posts;
}
