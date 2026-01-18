import { Router } from "express";
import { commentController } from "./comment.controller";
import middleware, { userRole } from "../../middleware/middleware";

const router = Router();

router.post("/", middleware(userRole.USER), commentController.createComment);

export const commentRouter = router;

