import { Request, Response } from "express";
import { userService } from "./user.service";
import { success } from "better-auth/*";
import { userRole } from "../../middleware/middleware";

const getAllUser = async (req: Request, res: Response) => {
  try {
    const result = await userService.getAllUser();
    res.status(200).json({
      success: true,
      msg:
        result.length === 0 ? "No users found" : "Users fetched successfully",
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      err: err instanceof Error ? err.message : "Something went wrong!",
    });
  }
};

const getUserById = async (req: Request, res: Response) => {
  try {
    const requestedUser = req.params.userId ? req.params.userId : undefined;
    const loggedInUser = req.user?.id;

    const result = await userService.getUserById(
      requestedUser as string,
      loggedInUser as string,
      req.user?.role as userRole,
    );
    res.status(200).json({
      success: true,
      msg: "Users fetched successfully",
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      err: err instanceof Error ? err.message : "Something went wrong!",
    });
  }
};

const updateUser = async (req: Request, res: Response) => {
  try {
    const requestedUser = req.params.userId ? req.params.userId : undefined;
    const loggedInUser = req.user?.id;

    const result = await userService.updateUser(
      requestedUser as string,
      loggedInUser as string,
      req.user?.role as userRole,
      req.body,
    );
    res.status(200).json({
      success: true,
      msg: "User updated successfully",
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      err: err instanceof Error ? err.message : "Something went wrong!",
    });
  }
};

const updateUserPassword = async (req: Request, res: Response) => {
  try {
    const requestedUser = req.params.userId ? req.params.userId : undefined;
    const loggedInUser = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    const result = await userService.updateUserPassword(
      req,
      requestedUser as string,
      loggedInUser as string,
      req.user?.role as userRole,
      newPassword,
      currentPassword,
    );
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      err: err instanceof Error ? err.message : "Something went wrong!",
    });
  }
};

export const userController = {
  getAllUser,
  getUserById,
  updateUser,
  updateUserPassword,
};
