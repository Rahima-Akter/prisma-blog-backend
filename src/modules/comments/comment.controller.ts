import { Request, Response } from "express";
import { commentService } from "./comment.service";

const createComment = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    req.body.userId = user?.id;
    if (!user) {
      return res.status(403).json({
        success: false,
        msg: "Unauthorized!",
      });
    }

    const result = await commentService.createComment(req.body);
    res.status(201).json({
      msg: "Comment created successfully",
      data: result,
    });
  } catch (err) {
    // console.error(err);
    return res.status(500).json({
      msg: "Error creating Comment",
      error: err,
    });
  }
};

export const commentController = {
  createComment,
};
