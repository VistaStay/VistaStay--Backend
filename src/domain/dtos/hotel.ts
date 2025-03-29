import { z } from "zod";

export const CreateHotelDTO = z.object({
  name: z.string().min(1, { message: "Hotel name is required" }),
  location: z.string().min(1, { message: "Location is required" }),
  image: z.string().min(1, { message: "Image URL is required" }),
  price: z.number().min(0, { message: "Price must be a positive number" }),
  description: z.string().min(1, { message: "Description is required" }),
  amenities: z.array(z.string()).optional(),
});

const stringOrArray = z.union([z.string(), z.array(z.string())]).transform(val => 
  Array.isArray(val) ? val : [val]
);

export const HotelFilterDTO = z.object({
  locations: stringOrArray.optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  amenities: stringOrArray.optional(),
  sort: z.enum(['asc', 'desc']).optional(),
});