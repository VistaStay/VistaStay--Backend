import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: false, 
  },
  reviews: {
    type: Number,
    required: false, 
  },
  image: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0, 
  },
  description: {
    type: String,
    required: true,
  },
  amenities: {
    type: [String], 
    required: false, 
  },
  stripePriceId: {
    type: String,
    required: true,
  }
});

const Hotel = mongoose.model("Hotel", hotelSchema);

export default Hotel;
