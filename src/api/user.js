import express from "express";
import { createUser } from "../application/user.js";

const usersRouter = express.Router();

usersRouter.post("/", createUser);

export default usersRouter;