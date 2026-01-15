import { Request, Response } from "express";
import { postService } from "./post.service";

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
      error: err,
    });
  }
};

const getPostByUser = async (req: Request, res: Response) => {
  try {
    const { authorId } = req.params;

    if (!authorId) {
      return res.status(403).json({
        success: false,
        msg: "Unauthorized!",
      });
    }

    const result = await postService.getPostByUser(authorId as string);

    if (!result.length) {
      return res.status(204).json({
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
      error: err,
    });
  }
};

const getAllPosts = async (req: Request, res: Response) => {
  try {
    const result = await postService.getAllPosts();

    if (!result.length) {
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
      error: err,
    });
  }
};

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
      error: err,
    });
  }
};

export const postController = {
  createPost,
  getAllPosts,
  getPostByUser,
  getPostById,
};
