import { Request } from "express";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { userRole } from "../../middleware/middleware";
import { hashPassword } from "better-auth/crypto";


const getAllUser = () => {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      createdAt: true,
      updatedAt: true,
      role: true,
      phoneNumber: true,
      status: true,
      sessions: {
        orderBy: { createdAt: "desc" },
        take: 1, // last login
        select: {
          createdAt: true,
          ipAddress: true,
          userAgent: true,
        },
      },
      accounts: {
        select: {
          providerId: true,
        },
      },
    },
  });
};

const getUserById = async (
  requestedUser: string,
  loggedInUser: string,
  userRole: userRole,
) => {
  if (requestedUser !== loggedInUser && userRole !== "ADMIN") {
    throw new Error(" YOU ARE NOT ALLOWED TO ACCESS OTHERS RESOURCES! ");
  }

  await prisma.user.findUniqueOrThrow({
    where: {
      id: requestedUser,
    },
    select: { id: true },
  });

  return await prisma.user.findUnique({
    where: {
      id: requestedUser,
    },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      createdAt: true,
      updatedAt: true,
      role: true,
      phoneNumber: true,
      status: true,
      sessions: {
        orderBy: { createdAt: "desc" },
        take: 1, // last login
        select: {
          createdAt: true,
          ipAddress: true,
          userAgent: true,
        },
      },
      accounts: {
        select: {
          providerId: true,
        },
      },
    },
  });
};

const updateUser = async (
  requestedUser: string,
  loggedInUser: string,
  userRole: userRole,
  payLoad: {
    name?: string;
    phoneNumber?: string;
  },
) => {
  if (requestedUser !== loggedInUser && userRole !== "ADMIN") {
    throw new Error("YOU ARE NOT AUTHORIZED!");
  }

  await prisma.user.findUniqueOrThrow({
    where: {
      id: requestedUser,
    },
    select: { id: true },
  });

  return await prisma.user.update({
    where: {
      id: requestedUser,
    },
    data: payLoad,
  });
};

const updateUserPassword = async (
  req: Request,
  requestedUser: string,
  loggedInUser: string,
  role: userRole,
  newPassword: string,
  currentPassword?: string
) => { 
    // console.log(auth.api.admin())
  // Check authorization
  if (requestedUser !== loggedInUser && role !== "ADMIN") {
    throw new Error("NOT AUTHORIZED");
  }

  // Get cookie for Better Auth
  const cookie = req.headers["cookie"];
  if (!cookie) throw new Error("Authentication required");

  // User updating their own password (works perfectly)
  if (requestedUser === loggedInUser) {
    if (!currentPassword) {
      throw new Error("Current password is required");
    }

    if (newPassword === currentPassword) {
      throw new Error("New password cannot be the same as current password");
    }

    const result = await auth.api.changePassword({
      headers: { Cookie: cookie },
      body: {
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      },
    });

    if (!result.user) {
      throw new Error("Password update failed");
    }

    return {
      success: true,
      msg: "Password updated successfully",
    };
  }

  // Admin updating another user
  if (role === "ADMIN" && requestedUser !== loggedInUser) {
    // Verify user exists
    await prisma.user.findUniqueOrThrow({
      where: { id: requestedUser },
      select: { id: true },
    });

    // Hash password using Better Auth's internal hash function
    const hashedPassword = await hashPassword(newPassword);

    // Update password directly in database
    await prisma.account.updateMany({
      where: { userId: requestedUser },
      data: { password: hashedPassword },
    });

    return {
      success: true,
      msg: "Password updated by admin successfully",
    };
  }

  throw new Error("Invalid password update request");
};



export const userService = {
  getAllUser,
  getUserById,
  updateUser,
  updateUserPassword,
};
