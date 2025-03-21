import { z } from "zod"

export const CreateHotelDTO = z.object({
   hotelId:z.string(),
   checkIn:z.string(),
   checkout:z.string(),
   roonNumber:z.number(),
});