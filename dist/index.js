"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const db_1 = __importDefault(require("./infastructure/db"));
const hotel_1 = __importDefault(require("./api/hotel"));
const user_1 = __importDefault(require("./api/user"));
const booking_1 = __importDefault(require("./api/booking"));
const global_error_handlig_middleware_1 = __importDefault(require("./api/middlewares/global-error-handlig-middleware"));
const express_2 = require("@clerk/express");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, express_2.clerkMiddleware)());
app.use((0, cors_1.default)());
(0, db_1.default)();
app.use("/api/hotels", hotel_1.default);
app.use("/api/users", user_1.default);
app.use("/api/bookings", booking_1.default);
app.use(global_error_handlig_middleware_1.default);
app.listen(8081, () => {
    console.log("server is running on port 8081");
});
//# sourceMappingURL=index.js.map