import { NextFunction, Request, Response } from "express";
import Booking from "../infastructure/schemas/Booking"; // Fixed typo in path
import { CreateBookingDTO } from "../domain/dtos/booking";
import ValidationError from "../domain/errors/validation-error";
import { clerkClient } from "@clerk/express";

interface AuthenticatedRequest extends Request {
  auth?: {
    userId?: string;
  };
}

export const createBooking = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsedBooking = CreateBookingDTO.safeParse(req.body);

    if (!parsedBooking.success) {
      throw new ValidationError(parsedBooking.error.message);
    }

    if (!req.auth?.userId) {
      throw new ValidationError("User authentication required");
    }
    console.log(req.auth);

    const { hotelId, checkIn, checkOut, roomNumber } = parsedBooking.data;

    // Add the booking
    await Booking.create({
      hotelId,
      userId: req.auth.userId,
      checkIn,
      checkOut,
      roomNumber,
    });

    res.status(201).send();
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
    const bookings = await Booking.find({ hotelId });

    const bookingsWithUser = await Promise.all(
      bookings.map(async (el) => {
        try {
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
        } catch (error) {
          console.error(`Failed to fetch user data for userId: ${el.userId}`);
          return {
            _id: el._id,
            hotelId: el.hotelId,
            checkIn: el.checkIn,
            checkOut: el.checkOut,
            roomNumber: el.roomNumber,
            user: null, // Handle missing user case
          };
        }
      })
    );

    res.status(200).json(bookingsWithUser);
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
  } catch (error) {
    next(error);
  }
};
