import { Router } from "express";
import { commentController } from "./comment.controller";
import middleware, { userRole } from "../../middleware/middleware";

const router = Router();

router.post(
  "/",
  middleware(userRole.USER, userRole.ADMIN),
  commentController.createComment,
);
router.patch(
  "/:commentId",
  middleware(userRole.USER, userRole.ADMIN),
  commentController.updateComment,
);
router.patch(
  "/:commentId/status",
  middleware(userRole.ADMIN),
  commentController.updateComentStatus,
);

router.delete(
  "/:commentId",
  middleware(userRole.ADMIN, userRole.USER),
  commentController.deleteComent,
);

router.get(
  "/allComments",
  middleware(userRole.ADMIN),
  commentController.getAllComments,
);

export const commentRouter = router;
