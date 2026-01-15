import { Post } from "../../../generated/prisma/client";
import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";

const getAllPosts = async (
  searchQuery: string | undefined,
  tags: string[],
  isFeatured: boolean
) => {
  const andQuery: PostWhereInput[] = [];
  if (searchQuery) {
    andQuery.push({
      OR: [
        {
          title: {
            contains: searchQuery,
            mode: "insensitive",
          },
        },
        {
          tags: {
            has: searchQuery.toLocaleLowerCase(),
          },
        },
      ],
    });
  }
  if (tags.length > 0) {
    andQuery.push({
      tags: {
        hasEvery: tags,
      },
    });
  }

  if (typeof isFeatured === "boolean") {
    andQuery.push({
      isFeatured,
    });
  }

  return await prisma.post.findMany({
    where: {
      AND: andQuery,
    },
  });
};

const getPostByUser = async (authorId: string) => {
  return await prisma.post.findMany({
    where: {
      authorId,
    },
  });
};

const getPostById = async (postId: string) => {
  return await prisma.$transaction(async (tx) => {
    await tx.post.update({
      where: { id: postId },
      data: { views: { increment: 1 } },
    });
    return await tx.post.findUnique({ where: { id: postId } });
  });

  // const incrementView = await prisma.post.update({
  //   where: {
  //     id: postId,
  //   },
  //   data: {
  //     views: {
  //       increment: 1,
  //     },
  //   },
  // });
  // const result = await prisma.post.findUnique({
  //   where: {
  //     id: postId,
  //   },
  // });

  // return {
  //   result,
  // };
};

const createPost = async (
  payLoad: Omit<Post, "id" | "createdAt" | "updatedAt" | "authorId">,
  userId: string
) => {
  return await prisma.post.create({
    data: {
      ...payLoad,
      authorId: userId,
    },
  });
};

export const postService = {
  createPost,
  getAllPosts,
  getPostByUser,
  getPostById,
};
