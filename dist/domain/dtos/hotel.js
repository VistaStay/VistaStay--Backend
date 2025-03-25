"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateHotelDTO = void 0;
const zod_1 = require("zod");
exports.CreateHotelDTO = zod_1.z.object({
    name: zod_1.z.string().min(1, { message: "Hotel name is required" }),
    location: zod_1.z.string().min(1, { message: "Location is required" }),
    image: zod_1.z.string().min(1, { message: "Image URL is required" }),
    price: zod_1.z.number().min(0, { message: "Price must be a positive number" }), // Changed to number
    description: zod_1.z.string().min(1, { message: "Description is required" }),
});
//# sourceMappingURL=hotel.js.map