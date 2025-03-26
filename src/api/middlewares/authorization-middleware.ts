import { NextFunction, Request, Response } from "express";
import ForbiddenError from "../../domain/errors/fobidden-error";
import { clerkClient } from "@clerk/express";

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!(req?.auth?.sessionClaims?.role !== "admin")) {
        throw new ForbiddenError("Forbidden");
    }

    next();
}