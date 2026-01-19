import {
  CommentStatus,
  Post,
  PostStatus,
} from "../../../generated/prisma/client";
import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { userRole } from "../../middleware/middleware";

const createPost = async (
  payLoad: Omit<Post, "id" | "createdAt" | "updatedAt" | "authorId">,
  userId: string,
) => {
  return await prisma.post.create({
    data: {
      ...payLoad,
      authorId: userId,
    },
  });
};

const getAllPosts = async (
  searchQuery: string | undefined,
  tags: string[],
  isFeatured: boolean,
  status: PostStatus | undefined,
  page: number,
  limit: number,
  skip: number,
  sortBy: string,
  sortOrder: string,
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

  if (status) {
    andQuery.push({
      status,
    });
  }

  // let orderBy: any = {createdAt: 'desc'}
  // if(sortBy && sortOrder){
  //   orderBy = {
  //     [sortBy]: sortOrder
  //   }
  // }

  const result = await prisma.post.findMany({
    take: limit,
    skip,
    where: {
      AND: andQuery,
    },
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      comments: {
        where: {
          commentParentId: null,
          status: CommentStatus.APPROVED,
        },
        include: {
          replies: {
            where: {
              status: CommentStatus.APPROVED,
            },
          },
        },
      },
    },
  });

  const Data = await prisma.post.count({
    where: {
      AND: andQuery,
    },
  });
  return {
    result,
    totalData: Data,
    currentPage: page,
    limit,
    totalPage: Math.ceil(Data / limit),
  };
};

const getPostByUser = async (authorId: string) => {
  // console.log({authorId}, 'from service')
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
    return await tx.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        comments: {
          where: {
            commentParentId: null,
            status: CommentStatus.APPROVED,
          },
          include: {
            replies: {
              where: {
                status: CommentStatus.APPROVED,
              },
            },
          },
        },
      },
    });
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

const updatePost = async (
  payLoad: {
    title?: string;
    content?: string;
    thumbnail?: string;
    tags?: string[];
    status?: PostStatus;
  },
  postId: string,
  userId: string,
  userRole: userRole,
) => {
  // console.log({postId, userId})
  const result = await prisma.post.findUniqueOrThrow({
    where: { id: postId },
    select: { authorId: true },
  });

  if (userId !== result.authorId && userRole !== "ADMIN") {
    throw new Error("You are not allowed to update others posts!");
  }

  return await prisma.post.update({
    where: {
      id: postId,
    },
    data: payLoad,
  });
};

const updatePostIsFeatured = async (
  isFeatured: boolean,
  postId: string,
  userRole: userRole,
) => {
  const result = await prisma.post.findUniqueOrThrow({
    where: {
      id: postId,
    },
    select: {
      isFeatured: true,
    },
  });

  if (isFeatured !== undefined && isFeatured === result.isFeatured) {
    throw new Error(`isFeatured is already => ${isFeatured}`);
  }

  if (userRole !== "ADMIN") {
    throw new Error("You don't have permission to perform this action!");
  }

  return await prisma.post.update({
    where: {
      id: postId,
    },
    data: {isFeatured},
    select: {
      id: true,
      title: true,
      isFeatured: true,
    },
  });
};

export const postService = {
  createPost,
  getAllPosts,
  getPostByUser,
  getPostById,
  updatePost,
  updatePostIsFeatured,
};
