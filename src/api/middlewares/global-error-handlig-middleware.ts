import { Request , Response , NextFunction } from "express";

const globalErrorHandlingMiddleware = (
    error : Error,
    req : Request,
    res : Response,
    next : NextFunction
) => {
    console.log(error);
    if(error.name === "NotFoundError"){
        res.status(404).json({ message: error.message });
        return;
    }

    if(error.name === "VlidationError"){
        res.status(400).json({ message: error.message });
        return;
    }

    res.status(500).json({ message: "Internal Server Error" });
};

export default globalErrorHandlingMiddleware;