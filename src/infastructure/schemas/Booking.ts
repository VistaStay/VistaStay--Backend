import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    hotelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hotel",
        required: true,
    },
    userId: {
        type: String,
        ref: "User",
        required: true,
    },
    checkIn: {
        type: Date,
        required: true,
    },
    checkOut: {
        type: Date,
        required: true,
    },
    roomNumber: {
        type: Number,
        required: true,
        default: function () {
            return Math.floor(Math.random() * 400) + 100; // Auto-generate room number
        },
    },
});

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
