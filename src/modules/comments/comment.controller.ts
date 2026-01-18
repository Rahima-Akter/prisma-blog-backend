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
    res.status(200).json({
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

const updateComment = async (req: Request, res: Response) => {
  try {
    const commentId = req.params.commentId;
    const {comment} = req.body;

    if (!commentId) {
      return res.status(403).json({
        success: false,
        msg: `Comment ID: ${commentId} NOT FOUND!`,
      });
    }

    const result = await commentService.updateComment(commentId, comment);
    res.status(200).json({
      msg: "Comment updated successfully",
      data: result,
    });
  } catch (err) {
    // console.error(err);
    return res.status(500).json({
      msg: "Error updating Comment",
      error: err,
    });
  }
};

export const commentController = {
  createComment,
  updateComment,
};
