import { Request, Response, NextFunction } from "express";

import Booking from "../infastructure/schemas/Booking";

export const createBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const booking = req.body;

    // Validate the request data
    if (
      !booking.hotelId ||
      !booking.userId ||
      !booking.checkIn ||
      !booking.checkOut ||
      !booking.roomNumber
    ) {
        res.status(400).send();
        return;
    }

    // Add the booking
    await Booking.create({
      hotelId: booking.hotelId,
      userId: booking.userId,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      roomNumber: booking.roomNumber,
    });

    // Return the response
    res.status(201).send();
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
    const bookings = await Booking.find({ hotelId: hotelId }).populate("userId");

    res.status(200).json(bookings);
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

//Implement Chatgpt AI
//implement chgpt llm
export const generateResonse= async(
  req:Request,
  res:Response,
  next:NextFunction
) => {
  const {prompt} = req.body;

  const openai = new OpenAI({
    apiKey:process.env.OPEN_API_KEY,
  });
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
        {
            role: "system",
            content: "You are a helpful assistant",
        },
        {
          role: "user",
            content: prompt,
        }
    ],
    store:true,
});

  console.log(completion.choices[0].message);
  res.status(200).json({message:completion.choices[0].message.content});
  return;
}
