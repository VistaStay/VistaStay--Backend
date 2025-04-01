"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const payment_1 = __importDefault(require("./api/payment"));
const db_1 = __importDefault(require("./infastructure/db"));
const hotel_1 = __importDefault(require("./api/hotel"));
const user_1 = __importDefault(require("./api/user"));
const booking_1 = __importDefault(require("./api/booking"));
const body_parser_1 = __importDefault(require("body-parser"));
const global_error_handlig_middleware_1 = __importDefault(require("./api/middlewares/global-error-handlig-middleware"));
const express_2 = require("@clerk/express");
const payment_2 = require("./application/payment");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, express_2.clerkMiddleware)());
app.use((0, cors_1.default)({ origin: "https://hotelapp-vistastay-frontend-sharada.netlify.app/" }));
(0, db_1.default)();
app.post("/api/stripe/webhook", body_parser_1.default.raw({ type: "application/json" }), payment_2.handleWebhook);
app.use("/api/hotels", hotel_1.default);
app.use("/api/users", user_1.default);
app.use("/api/bookings", booking_1.default);
app.use("/api/payments", payment_1.default);
app.use(global_error_handlig_middleware_1.default);
app.listen(8083, () => {
    console.log("server is running on port 8083");
});
//# sourceMappingURL=index.js.map