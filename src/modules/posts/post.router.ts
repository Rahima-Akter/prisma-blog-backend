import express from "express";
import { postController } from "./post.controller";
import middleware, { userRole } from "../../middleware/middleware";
const router = express.Router();

router.get(
  "/:authorId",
  middleware(userRole.ADMIN, userRole.USER),
  postController.getPostByUser,
);
router.get("/", postController.getAllPosts);
router.get("/:postId", postController.getPostById);
router.get("/stats", middleware(userRole.ADMIN), postController.stats);

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

router.delete(
  "/:postId",
  middleware(userRole.ADMIN, userRole.USER),
  postController.deletepost,
);

export const postRouter = router;
