import { NextFunction, Request, Response } from "express";

import Booking from "../infastructure/schemas/Booking";
import { CreateBookingDTO } from "../domain/dtos/booking";
import ValidationError from "../domain/errors/validation-error";
import { clerkClient } from "@clerk/express";
import NotFoundError from "../domain/errors/not-found-error";
import Hotel from "../infastructure/schemas/Hotel";

export const createBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const booking = CreateBookingDTO.safeParse(req.body);
    console.log(booking);
    // Validate the request data
    if (!booking.success) {
      throw new ValidationError(booking.error.message);
    }

    const user = req.auth;

    // Add the booking
    const newBooking = await Booking.create({
      hotelId: booking.data.hotelId,
      userId: user.userId,
      checkIn: booking.data.checkIn,
      checkOut: booking.data.checkOut,
      roomNumber: await (async () => {
        let roomNumber;
        let isRoomAvailable = false;
        while (!isRoomAvailable) {
          roomNumber = Math.floor(Math.random() * 1000) + 1;
          const existingBooking = await Booking.findOne({
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
  } catch (error) {
    next(error);
  }
};

export const getAllBookingsForHotel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const hotelId = req.params.hotelId;
    const bookings = await Booking.find({ hotelId: hotelId });
    const bookingsWithUser = await Promise.all(
      bookings.map(async (el) => {
        const user = await clerkClient.users.getUser(el.userId);
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
      })
    );

    res.status(200).json(bookingsWithUser);
    return;
  } catch (error) {
    next(error);
  }
};

export const getAllBookings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookings = await Booking.find();

    res.status(200).json(bookings);
    return;
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookingId = req.params.bookingId;
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new NotFoundError("Booking not found");
    }
    res.status(200).json(booking);
    return;
  } catch (error) {
    next(error);
  }
};