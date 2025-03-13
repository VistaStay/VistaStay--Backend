import { z } from "zod";

export const CreateBookingDTO = z.object({
   hotelId: z.string().min(1, { message: "Hotel ID is required" }),
   checkIn: z.string().min(1, { message: "Check-in date is required" }),
   checkOut: z.string().min(1, { message: "Check-out date is required" }),
});
