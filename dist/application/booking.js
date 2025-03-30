"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBookingById = exports.getAllBookings = exports.getAllBookingsForHotel = exports.createBooking = void 0;
const Booking_1 = __importDefault(require("../infastructure/schemas/Booking"));
const booking_1 = require("../domain/dtos/booking");
const validation_error_1 = __importDefault(require("../domain/errors/validation-error"));
const express_1 = require("@clerk/express");
const not_found_error_1 = __importDefault(require("../domain/errors/not-found-error"));
const createBooking = async (req, res, next) => {
    try {
        const booking = booking_1.CreateBookingDTO.safeParse(req.body);
        console.log(booking);
        // Validate the request data
        if (!booking.success) {
            throw new validation_error_1.default(booking.error.message);
        }
        const user = req.auth;
        // Add the booking
        const newBooking = await Booking_1.default.create({
            hotelId: booking.data.hotelId,
            userId: user.userId,
            checkIn: booking.data.checkIn,
            checkOut: booking.data.checkOut,
            roomNumber: await (async () => {
                let roomNumber;
                let isRoomAvailable = false;
                while (!isRoomAvailable) {
                    roomNumber = Math.floor(Math.random() * 1000) + 1;
                    const existingBooking = await Booking_1.default.findOne({
                        hotelId: booking.data.hotelId,
                        roomNumber: roomNumber,
                        $or: [
                            {
                                checkIn: { $lte: booking.data.checkOut },
                                checkOut: { $gte: booking.data.checkIn },
                            },
                        ],
                    });
                    isRoomAvailable = !existingBooking;
                }
                return roomNumber;
            })(),
        });
        // Return the response
        res.status(201).json(newBooking);
        return;
    }
    catch (error) {
        next(error);
    }
};
exports.createBooking = createBooking;
const getAllBookingsForHotel = async (req, res, next) => {
    try {
        const hotelId = req.params.hotelId;
        const bookings = await Booking_1.default.find({ hotelId: hotelId });
        const bookingsWithUser = await Promise.all(bookings.map(async (el) => {
            const user = await express_1.clerkClient.users.getUser(el.userId);
            return {
                _id: el._id,
                hotelId: el.hotelId,
                checkIn: el.checkIn,
                checkOut: el.checkOut,
                roomNumber: el.roomNumber,
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                },
            };
        }));
        res.status(200).json(bookingsWithUser);
        return;
    }
    catch (error) {
        next(error);
    }
};
exports.getAllBookingsForHotel = getAllBookingsForHotel;
const getAllBookings = async (req, res, next) => {
    try {
        const bookings = await Booking_1.default.find();
        res.status(200).json(bookings);
        return;
    }
    catch (error) {
        next(error);
    }
};
exports.getAllBookings = getAllBookings;
const getBookingById = async (req, res, next) => {
    try {
        const bookingId = req.params.bookingId;
        const booking = await Booking_1.default.findById(bookingId);
        if (!booking) {
            throw new not_found_error_1.default("Booking not found");
        }
        res.status(200).json(booking);
        return;
    }
    catch (error) {
        next(error);
    }
};
exports.getBookingById = getBookingById;
//# sourceMappingURL=booking.js.map