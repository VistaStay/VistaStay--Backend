import { NextFunction, Request, Response } from "express";
import ValidationError from "../domain/errors/validation-error";
import { CreateBookingDTO } from "../domain/dtos/booking";
import Booking from "../infastructure/schemas/Booking";

export const createBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const booking = CreateBookingDTO.safeParse(req.body);

    if (!booking.success) {
      throw new ValidationError(booking.error.message);
    }

    const user = req.auth; // Get authenticated user
    if (!user || !user.userId) {
      throw new ValidationError("User authentication failed");
    }

    // Generate a random room number between 100 and 500
    const randomRoomNumber = Math.floor(Math.random() * 400) + 100;

    // Create booking in the database
    const newBooking = await Booking.create({
      hotelId: booking.data.hotelId,
      userId: user.userId,
      checkIn: booking.data.checkIn,
      checkOut: booking.data.checkOut,
      roomNumber: randomRoomNumber,
    });

    res.status(201).json({
      message: "Booking created successfully",
      bookingId: newBooking._id,
    });
    return;
  } catch (error) {
    next(error);
  }
};
