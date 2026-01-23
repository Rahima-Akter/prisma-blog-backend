import { promise, success } from "better-auth/*";
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
  const data = await prisma.post.findMany({
    where: {
      authorId,
    },
  });
  const totalPostCount = await prisma.post.count({
    where: {
      authorId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  const totalViewsCount = await prisma.post.aggregate({
    where: {
      authorId,
    },
    _sum: {
      views: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return {
    data,
    totalPostCount,
    totalViewsCount: totalViewsCount._sum.views,
  };
};

const getPostById = async (postId: string) => {
  return await prisma.$transaction(async (tx) => {
    await tx.post.update({
      where: { id: postId },
      data: { views: { increment: 1 } },
    });
    const post = await tx.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        comments: {
          where: {
            commentParentId: null,
            status: CommentStatus.APPROVED,
          },
          orderBy: {
            createdAt: "desc",
          },
          include: {
            replies: {
              where: {
                status: CommentStatus.APPROVED,
              },
              orderBy: {
                createdAt: "desc",
              },
            },
          },
        },
      },
    });
    const commentsCount = await tx.comments.count({
      where: {
        postId: postId,
        status: CommentStatus.APPROVED,
      },
    });
    return {
      post,
      commentsCount,
    };
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
    data: { isFeatured },
    select: {
      id: true,
      title: true,
      isFeatured: true,
    },
  });
};

const deletepost = async (postId: string, userRole: userRole) => {
  await prisma.post.findUniqueOrThrow({
    where: {
      id: postId,
    },
  });

  if (userRole !== "ADMIN") {
    throw new Error("You are not allowed to delete others posts!");
  }

  return await prisma.post.delete({
    where: {
      id: postId,
    },
    select: {
      id: true,
      title: true,
    },
  });
};

const stats = async () => {
  return await prisma.$transaction(async (tx) => {
    const [
      totalPosts,
      publlishedPosts,
      draftPosts,
      archivedPosts,
      totalComments,
      approvedComment,
      rejectedComment,
      totalUsers,
      adminCount,
      NormalUserCount,
      totalViews,
    ] = await Promise.all([
      await tx.post.count(),
      await tx.post.count({ where: { status: PostStatus.PUBLISHED } }),
      await tx.post.count({ where: { status: PostStatus.DRAFT } }),
      await tx.post.count({ where: { status: PostStatus.ARCHIVED } }),
      await tx.comments.count(),
      await tx.comments.count({ where: { status: CommentStatus.APPROVED } }),
      await tx.comments.count({ where: { status: CommentStatus.REJECT } }),
      await tx.user.count(),
      await tx.user.count({ where: { role: userRole.ADMIN } }),
      await tx.user.count({ where: { role: userRole.USER } }),
      await tx.post.aggregate({ _sum: { views: true } }),
    ]);
    return {
      totalPosts,
      publlishedPosts,
      draftPosts,
      archivedPosts,
      totalComments,
      approvedComment,
      rejectedComment,
      totalUsers,
      adminCount,
      NormalUserCount,
      totalViews: totalViews._sum.views,
    };
  });
};

export const postService = {
  createPost,
  getAllPosts,
  getPostByUser,
  getPostById,
  updatePost,
  updatePostIsFeatured,
  deletepost,
  stats,
};
