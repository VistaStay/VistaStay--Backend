import { Request, Response, NextFunction } from "express";
import FobiddenError from "../../domain/errors/fobidden-error";

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!(req?.auth?.sessionClaims?.role !== "admin")) { 
        throw new FobiddenError("fobiddenError"); 
    }
    next();
};
