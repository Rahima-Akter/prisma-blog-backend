import express from "express";
import { postController } from "./post.controller";
import middleware, { userRole } from "../../middleware/middleware";
const router = express.Router();

router.get("/", postController.getAllPosts);
router.get("/:postId", postController.getPostById);
router.get(
  "/:authorId",
  middleware(userRole.ADMIN, userRole.USER),
  postController.getPostByUser,
);

router.post(
  "/",
  middleware(userRole.USER, userRole.ADMIN),
  postController.createPost,
);

router.patch(
  "/:postId",
  middleware(userRole.USER, userRole.ADMIN),
  postController.updatePost,
);
router.patch(
  "/:postId/isFeatured",
  middleware(userRole.ADMIN),
  postController.updatePostIsFeatured,
);

export default router;
