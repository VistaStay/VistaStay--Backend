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
    required: false, // Optional field
  },
  reviews: {
    type: Number,
    required: false, // Optional field
  },
  image: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0, // Ensure price isn't negative
  },
  description: {
    type: String,
    required: true,
  },
  amenities: {
    type: [String], // Array of strings to store selected amenities
    required: false, // Optional field
  },
});

const Hotel = mongoose.model("Hotel", hotelSchema);

export default Hotel;
