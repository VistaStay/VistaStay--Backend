"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = exports.ensureUserId = exports.isAuthenticated = void 0;
const fobidden_error_1 = __importDefault(require("../../domain/errors/fobidden-error")); // Adjust path
const clerk_sdk_node_1 = require("@clerk/clerk-sdk-node");
exports.isAuthenticated = (0, clerk_sdk_node_1.ClerkExpressRequireAuth)({
    onError: (error) => {
        console.error("Clerk authentication error:", error);
        throw new Error(`Authentication failed: ${error.message}`);
    }
});
const ensureUserId = (req, res, next) => {
    if (!req.auth?.userId) {
        console.error("No userId found in request auth:", req.auth);
        return res.status(401).json({ message: "Unauthorized: No userId" });
    }
    console.log("Authenticated userId:", req.auth.userId); // Log for debugging
    next();
};
exports.ensureUserId = ensureUserId;
const isAdmin = (req, res, next) => {
    if (req.auth?.sessionClaims?.role !== "admin") {
        console.error("User is not an admin:", req.auth?.sessionClaims);
        throw new fobidden_error_1.default("Forbidden: Admin access required");
    }
    next();
};
exports.isAdmin = isAdmin;
//# sourceMappingURL=authorization-middleware.js.map