import { Router } from "express";
import middleware, { userRole } from "../../middleware/middleware";
import { userController } from "./user.controller";

const router = Router();

router.get("/", middleware(userRole.ADMIN), userController.getAllUser);
router.get("/:userId", middleware(userRole.ADMIN, userRole.USER), userController.getUserById);
router.patch("/:userId", middleware(userRole.ADMIN, userRole.USER), userController.updateUser);
router.patch("/:userId/password", middleware(userRole.ADMIN, userRole.USER), userController.updateUserPassword);
router.delete("/:userId", middleware(userRole.ADMIN), userController.deleteUser);

export const userRouter = router;
