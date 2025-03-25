import { Request, Response, NextFunction } from "express";
import FobiddenError from "../../domain/errors/fobidden-error";

interface AuthenticatedRequest extends Request {
  auth?: {
    userId?: string;
    sessionClaims?: {
      role?: string;
    };
  };
}

export const isAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (req.auth?.sessionClaims?.role !== "admin") {  // Fixed condition
        throw new FobiddenError("Forbidden: Admin access required"); 
    }
    next();
};
