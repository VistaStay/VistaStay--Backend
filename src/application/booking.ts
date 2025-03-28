import { NextFunction, Request, Response } from "express";
import Booking from "../infastructure/schemas/Booking";
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
): Promise<void> => {
  try {
    const parsedBooking = CreateBookingDTO.safeParse(req.body);

    if (!parsedBooking.success) {
      throw new ValidationError(parsedBooking.error.errors.map(e => e.message).join(", "));
    }

    if (!req.auth?.userId) {
      throw new ValidationError("User authentication required");
    }

    const { hotelId, checkIn, checkOut, roomNumber, totalprice } = parsedBooking.data;

    const newBooking = await Booking.create({
      hotelId,
      userId: req.auth.userId,
      checkIn,
      checkOut,
      roomNumber,
      totalprice
    });

    res.status(201).json(newBooking);
  } catch (error) {
    next(error);
  }
};

export const getAllBookingsForHotel = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
            totalprice: el.totalprice,
            user: user
              ? {
                  id: user.id,
                  firstName: user.firstName,
                  lastName: user.lastName,
                }
              : null,
          };
        } catch (error) {
          console.error(`Failed to fetch user data for userId: ${el.userId}`);
          return {
            _id: el._id,
            hotelId: el.hotelId,
            checkIn: el.checkIn,
            checkOut: el.checkOut,
            roomNumber: el.roomNumber,
            totalprice: el.totalprice,
            user: null,
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
): Promise<void> => {
  try {
    const bookings = await Booking.find();
    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
};

export const deleteBooking = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const bookingId = req.params.bookingId;
    const userId = req.auth?.userId;

    if (!userId) {
      throw new ValidationError("User authentication required");
    }

    const booking = await Booking.findOneAndDelete({
      _id: bookingId,
      userId: userId
    });

    if (!booking) {
      res.status(404).json({ message: "Booking not found or not authorized" });
      return;
    }

    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    next(error);
  }
};