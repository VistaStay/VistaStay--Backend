"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const payment_1 = require("./application/payment"); // Make sure handleWebhook is correctly implemented
const body_parser_1 = __importDefault(require("body-parser"));
const payment_2 = __importDefault(require("./api/payment")); // Make sure the routes are correct
const db_1 = __importDefault(require("./infastructure/db")); // Correct directory name
const hotel_1 = __importDefault(require("./api/hotel"));
const user_1 = __importDefault(require("./api/user")); // You may need this based on your structure
const booking_1 = __importDefault(require("./api/booking"));
const global_error_handlig_middleware_1 = __importDefault(require("./api/middlewares/global-error-handlig-middleware")); // Fix typo
const express_2 = require("@clerk/express");
const app = (0, express_1.default)();
// Middleware setup
app.use(express_1.default.json());
app.use((0, express_2.clerkMiddleware)()); // Clerk middleware for session handling
app.use((0, cors_1.default)({
    origin: "https://hotelapp-vistastay-frontend-sharada.netlify.app" // Correct frontend URL for CORS
}));
// Connect to the database
(0, db_1.default)();
// Route handling
app.use("/api/hotels", hotel_1.default);
app.use("/api/payments", payment_2.default);
app.use("/api/bookings", booking_1.default);
app.use("/api/users", user_1.default); // Add if necessary
// Global error handling middleware
app.use(global_error_handlig_middleware_1.default);
// Stripe webhook handling
app.post("/api/stripe/webhook", body_parser_1.default.raw({ type: "application/json" }), payment_1.handleWebhook);
// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
//# sourceMappingURL=index.js.map