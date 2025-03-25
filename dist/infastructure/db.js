"use strict";
//password
//fXHqCM6NYRHwFZ82
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//string
//mongodb+srv://sharadakanchana417:fXHqCM6NYRHwFZ82@hotelapp.1veed.mongodb.net/?retryWrites=true&w=majority&appName=HotelApp
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connectDB = async () => {
    try {
        const MONGODB_URL = process.env.MONGODB_URL;
        if (!MONGODB_URL) {
            throw new Error("MONGODB_URL is not set");
        }
        await mongoose_1.default.connect(MONGODB_URL); // ✅ Remove outdated options
        console.log("Connected to the database........");
    }
    catch (error) {
        console.error("Error connecting to the database....", error);
    }
};
exports.default = connectDB;
//# sourceMappingURL=db.js.map