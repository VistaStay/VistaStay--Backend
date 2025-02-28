//mongodb wlata therene widiyata ape file ekee struture ek withara kara deema
import mongoose from "mongoose";

const bookingScheme = new mongoose.Schema({
    hotelId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Hotel",
        required:true,
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    checkIn:{
        type:Date,
        required:true,
    },
    checkout:{
        type:Date,
        required:true,
    },
    roomNumber:{
        type:Number,
        required:true,
    }
 
});

const Booking = mongoose.model("Booking",bookingScheme);

export default Booking;