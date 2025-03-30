"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const authentication_middleware_1 = require("./middlewares/authentication-middleware");
const express_1 = __importDefault(require("express"));
const booking_1 = require("../application/booking");
const bookingsRouter = express_1.default.Router();
bookingsRouter.route("/").post(authentication_middleware_1.isAuthenticated, booking_1.createBooking).get(authentication_middleware_1.isAuthenticated, booking_1.getAllBookings);
bookingsRouter.route("/hotels/:hotelId").get(authentication_middleware_1.isAuthenticated, booking_1.getAllBookingsForHotel);
bookingsRouter.route("/:bookingId").get(authentication_middleware_1.isAuthenticated, booking_1.getBookingById);
exports.default = bookingsRouter;
//# sourceMappingURL=booking.js.map