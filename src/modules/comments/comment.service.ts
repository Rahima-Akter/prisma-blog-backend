import { prisma } from "../../lib/prisma";

const createComment = async (payLoad: {
  comment: string;
  userId: string;
  postId: string;
  commentParentId?: string;
}) => {
  await prisma.post.findUniqueOrThrow({
    where: {
      id: payLoad.postId,
    },
  });

  // commentParentId here is the first comment of the post
  let finalParentId: string | null = null;

  if (payLoad.commentParentId) {
    const mainComment = await prisma.comments.findUniqueOrThrow({
      where: {
        id: payLoad.commentParentId,
      },
    });

    // if someone tries to reply to a reply then the reply will be stored under the main comment
    finalParentId = mainComment.commentParentId
      ? mainComment.commentParentId
      : mainComment.id;
  }

  return await prisma.comments.create({
    data: {
      comment: payLoad.comment,
      userId: payLoad.userId,
      postId: payLoad.postId,
      commentParentId: finalParentId,
    },
  });
};

const updateComment = async (commentId: string, comment: string) => {
  await prisma.comments.findUniqueOrThrow({
    where: {
      id: commentId,
    },
  });

  return await prisma.comments.update({
    where: {
      id: commentId,
    },
    data: {
      comment: comment,
    },
  });
};

export const commentService = {
  createComment,
  updateComment,
};
