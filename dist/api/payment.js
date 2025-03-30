"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const payment_1 = require("../application/payment");
const authentication_middleware_1 = require("./middlewares/authentication-middleware");
const paymentsRouter = express_1.default.Router();
paymentsRouter
    .route("/create-checkout-session")
    .post(authentication_middleware_1.isAuthenticated, payment_1.createCheckoutSession);
paymentsRouter
    .route("/session-status")
    .get(authentication_middleware_1.isAuthenticated, payment_1.retrieveSessionStatus);
exports.default = paymentsRouter;
//# sourceMappingURL=payment.js.map