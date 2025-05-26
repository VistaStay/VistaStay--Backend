import { NextFunction, Request, Response } from "express";
import Booking from "../infastructure/schemas/Booking";
import { z } from "zod";
import ValidationError from "../domain/errors/validation-error";
import { clerkClient } from "@clerk/express";
import NotFoundError from "../domain/errors/not-found-error";

// Updated CreateBookingDTO schema to handle string inputs for dates
const CreateBookingDTO = z.object({
  hotelId: z.string(),
  checkIn: z.string().transform((val) => new Date(val)),
  checkOut: z.string().transform((val) => new Date(val)),
  numberOfRooms: z.number().int().min(1).max(5),
}).refine(
  (data) => !isNaN(data.checkIn.getTime()) && !isNaN(data.checkOut.getTime()),
  { message: "Invalid date format" }
).refine(
  (data) => data.checkOut > data.checkIn,
  { message: "Check-out date must be after check-in date", path: ["checkOut"] }
);

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

    const user = req.auth;
    const { hotelId, checkIn, checkOut, numberOfRooms } = booking.data;

    // Optional: Log the transformed dates for debugging
    console.log("Transformed checkIn:", checkIn);
    console.log("Transformed checkOut:", checkOut);

    // Find overlapping bookings
    const overlappingBookings = await Booking.find({
      hotelId: hotelId,
      $or: [
        { checkIn: { $lte: checkOut }, checkOut: { $gte: checkIn } },
      ],
    });

    // Collect all booked room numbers
    const bookedRoomNumbers = new Set<number>();
    overlappingBookings.forEach((b) => {
      b.roomNumbers.forEach((rn) => bookedRoomNumbers.add(rn));
    });

    // Assign unique room numbers
    const roomNumbers: number[] = [];
    while (roomNumbers.length < numberOfRooms) {
      const roomNumber = Math.floor(Math.random() * 1000) + 1;
      if (!bookedRoomNumbers.has(roomNumber) && !roomNumbers.includes(roomNumber)) {
        roomNumbers.push(roomNumber);
      }
    }

    // Create the booking
    const newBooking = await Booking.create({
      hotelId: hotelId,
      userId: user.userId,
      checkIn: checkIn,
      checkOut: checkOut,
      roomNumbers: roomNumbers,
    });

    res.status(201).json(newBooking);
    return;
  } catch (error) {
    next(error);
  }
};

// Other functions remain unchanged
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
          roomNumbers: el.roomNumbers,
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