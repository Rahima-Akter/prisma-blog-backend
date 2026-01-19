import { Request, Response } from "express";
import { postService } from "./post.service";
import { PostStatus } from "../../../generated/prisma/enums";
import paginationAndSortingHelper from "../../helper/paginationAndSortingHelper";
import { userRole } from "../../middleware/middleware";

const createPost = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(403).json({
        success: false,
        msg: "Unauthorized!",
      });
    }
    const result = await postService.createPost(req.body, user?.id as string);
    res.status(201).json({
      msg: "Post created successfully",
      data: result,
    });
  } catch (err) {
    // console.error(err);
    res.status(500).json({
      msg: "Error creating post",
      error: err instanceof Error ? err.message : err,
    });
  }
};

const getAllPosts = async (req: Request, res: Response) => {
  try {
    const { searchQuery } = req.query;
    const isFeatured = req.query.isFeatured
      ? req.query.isFeatured === "true"
        ? true
        : req.query.isFeatured === "false"
          ? false
          : undefined
      : undefined;

    const status = req.query.status as PostStatus | undefined;
    const tags = req.query.tags ? (req.query.tags as string).split(",") : [];

    const { page, limit, skip, sortBy, sortOrder } = paginationAndSortingHelper(
      req.query,
    );

    // console.log({ isFeatured });

    const result = await postService.getAllPosts(
      searchQuery as string,
      tags,
      isFeatured as boolean,
      status,
      page,
      limit,
      skip,
      sortBy,
      sortOrder,
    );

    if (!result) {
      res.status(204).json({
        msg: "There are not data to show!",
      });
    }

    res.status(200).json({
      msg: "Posts fetched successfully",
      data: result,
    });
  } catch (err) {
    res.status(404).json({
      msg: "Faild to fetch posts",
      error: err instanceof Error ? err.message : err,
    });
  }
};

const getPostById = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;

    if (!postId) {
      return res.status(400).json({
        success: false,
        msg: "Post ID is required",
      });
    }

    const result = await postService.getPostById(postId);

    if (!result) {
      return res.status(404).json({
        msg: `There is no post with this ID:${postId}`,
      });
    }

    res.status(200).json({
      msg: "Post fetched successfully",
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Faild to fetch post",
      error: err instanceof Error ? err.message : err,
    });
  }
};

const getPostByUser = async (req: Request, res: Response) => {
  try {
    const { authorId } = req.params;
    // console.log({authorId}, 'from controller')

    if (!authorId) {
      return res.status(403).json({
        success: false,
        msg: "Unauthorized!",
      });
    }

    const result = await postService.getPostByUser(authorId as string);

    if (!result.length) {
      return res.status(204).json({
        msg: "There are no data to show!",
      });
    }

    res.status(200).json({
      msg: "Posts fetched successfully",
      data: result,
    });
  } catch (err) {
    res.status(404).json({
      msg: "Faild to fetch posts",
      error: err instanceof Error ? err.message : err,
    });
  }
};

const updatePost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;

    if (!postId) {
      return res.status(403).json({
        success: false,
        msg: `NO POST FOUND WITH THE POST ID: ${postId!}`,
      });
    }

    const result = await postService.updatePost(
      req.body,
      postId,
      req.user?.id as string,
      req.user?.role as userRole,
    );

    if (!result) {
      return res.status(204).json({
        msg: "There are not data to show!",
      });
    }

    res.status(200).json({
      msg: "Posts updated successfully",
      data: result,
    });
  } catch (err) {
    // console.log({ err });
    res.status(404).json({
      msg: "Faild to update post!",
      error:
        err instanceof Error
          ? err.message
          : err instanceof Error
            ? err.message
            : err,
    });
  }
};

const updatePostIsFeatured = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;

    if (!postId) {
      return res.status(403).json({
        success: false,
        msg: `NO POST FOUND WITH THE POST ID: ${postId!}`,
      });
    }

    const isFeatured =
      req.body.isFeatured === true || req.body.isFeatured === "true"
        ? true
        : req.body.isFeatured === false || req.body.isFeatured === "false"
          ? false
          : undefined;

    const result = await postService.updatePostIsFeatured(
      isFeatured as boolean,
      postId,
      req.user?.role as userRole,
    );

    // if (!result) {
    //   return res.status(204).json({
    //     msg: "There are not data to show!",
    //   });
    // }

    res.status(200).json({
      msg: "Posts updated successfully",
      data: result,
    });
  } catch (err) {
    // console.log({ err });
    res.status(404).json({
      msg: "Faild to update post!",
      error:
        err instanceof Error
          ? err.message
          : err instanceof Error
            ? err.message
            : err,
    });
  }
};

export const postController = {
  createPost,
  getAllPosts,
  getPostByUser,
  getPostById,
  updatePost,
  updatePostIsFeatured,
};
