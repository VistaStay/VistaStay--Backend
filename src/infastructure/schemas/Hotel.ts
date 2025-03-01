//mongodb wlata therene widiyata ape file ekee struture ek withara kara deema
import mongoose from "mongoose";

const hotelScheme = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    location:{
        type:String,
        required:true,
    },
    rating:{
        type:Number,
        min:1,
        max:5,
    },
    reviews:{
        type:Number,
    },
    image:{
        type:String,
        required:true,
    },
    price:{
        type:Number,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
});

const Hotel = mongoose.model("Hotel",hotelScheme)

export default Hotel;