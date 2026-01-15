import { Post } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const getAllPosts = async () => {
  return await prisma.post.findMany();
};

const getPostByUser = async (authorId: string) => {
  return await prisma.post.findMany({
    where: {
      authorId,
    },
  });
};

const getPostById = async (postId: string) => {
  return await prisma.post.findUnique({
    where: {
      id: postId,
    },
  });
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
