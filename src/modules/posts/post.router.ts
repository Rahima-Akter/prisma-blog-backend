import express from "express";
import { postController } from "./post.controller";
import middleware, { userRole } from "../../middleware/middleware";
const router = express.Router();

router.get("/", postController.getAllPosts);
router.get("/:postId", postController.getPostById);

router.get(
  "/:authorId",
  middleware(userRole.ADMIN, userRole.USER),
  postController.getPostByUser
);

router.post(
  "/",
  middleware(userRole.USER, userRole.ADMIN),
  postController.createPost
);

export default router;
