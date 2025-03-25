"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateHotelDTO = void 0;
const zod_1 = require("zod");
exports.CreateHotelDTO = zod_1.z.object({
    hotelId: zod_1.z.string(),
    checkIn: zod_1.z.string(),
    checkout: zod_1.z.string(),
    roonNumber: zod_1.z.number(),
});
//# sourceMappingURL=booking.js.map