"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = void 0;
const fobidden_error_1 = __importDefault(require("../../domain/errors/fobidden-error"));
const isAdmin = (req, res, next) => {
    if (!(req?.auth?.sessionClaims?.role !== "admin")) {
        throw new fobidden_error_1.default("Forbidden");
    }
    next();
};
exports.isAdmin = isAdmin;
//# sourceMappingURL=authorization-middleware.js.map