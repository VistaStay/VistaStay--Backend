"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotelFilterDTO = exports.CreateHotelDTO = void 0;
const zod_1 = require("zod");
exports.CreateHotelDTO = zod_1.z.object({
    name: zod_1.z.string().min(1, { message: "Hotel name is required" }),
    location: zod_1.z.string().min(1, { message: "Location is required" }),
    image: zod_1.z.string().min(1, { message: "Image URL is required" }),
    price: zod_1.z.number().min(0, { message: "Price must be a positive number" }),
    description: zod_1.z.string().min(1, { message: "Description is required" }),
    amenities: zod_1.z.array(zod_1.z.string()).optional(),
});
const stringOrArray = zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).transform(val => Array.isArray(val) ? val : [val]);
exports.HotelFilterDTO = zod_1.z.object({
    locations: stringOrArray.optional(),
    minPrice: zod_1.z.coerce.number().min(0).optional(),
    maxPrice: zod_1.z.coerce.number().min(0).optional(),
    amenities: stringOrArray.optional(),
    sort: zod_1.z.enum(['asc', 'desc']).optional(),
});
//# sourceMappingURL=hotel.js.map