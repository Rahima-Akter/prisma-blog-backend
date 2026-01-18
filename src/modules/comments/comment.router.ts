import { Router } from "express";
import { commentController } from "./comment.controller";
import middleware, { userRole } from "../../middleware/middleware";

const router = Router();

router.post("/", middleware(userRole.USER, userRole.ADMIN), commentController.createComment);
router.patch("/:commentId", middleware(userRole.USER, userRole.ADMIN), commentController.updateComment);

export const commentRouter = router;