import { Request, Response, NextFunction } from "express";
import UnauthorizedError from "../../domain/errors/unauthorized-error";

interface AuthenticatedRequest extends Request {
  auth?: {
    userId?: string;
    sessionClaims?: {
      role?: string;
    };
  };
}

export const isAuthenticated = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.auth?.userId) { 
        throw new UnauthorizedError("Unauthorized"); 
    }
    console.log(req.auth);
    next();
};
