import { NextFunction, Request, Response } from "express";
import { auth } from "../lib/auth"; // from betterAuth

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        role: string;
        emailVerified: boolean;
      };
    }
  }
}

export enum userRole {
  ADMIN = "ADMIN",
  USER = "USER",
}

const middleware = (...roles: userRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // get logged-in user session
      const session = await auth.api.getSession({
        headers: req.headers as any,
      });
      // console.log(session);
      if (!session) {
        return res.status(401).json({
          success: false,
          msg: "You are not authorized!",
        });
      }
      if (!session?.user.emailVerified) {
        return res.status(403).json({
          success: false,
          msg: "Please Verify Your Email First!",
        });
      }

      req.user = {
        id: session?.user.id as string,
        name: session?.user.name as string,
        email: session?.user.email as string,
        role: session?.user.role?.toLocaleUpperCase() as userRole,
        emailVerified: session?.user.emailVerified as boolean,
      };

      if (roles.length && !roles.includes(req.user?.role as userRole)) {
        return res.status(403).json({
          success: false,
          msg: "Forbidden! You don't have permission",
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

export default middleware;
