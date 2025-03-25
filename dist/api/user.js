"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = require("../application/user");
const usersRouter = express_1.default.Router();
usersRouter.post("/", user_1.createUser);
exports.default = usersRouter;
//# sourceMappingURL=user.js.map