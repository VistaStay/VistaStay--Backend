import express from "express";
import { getAllHotels, getHotelById, createHotel, deleteHotel, updateHotel } from "../application/hotel.js";

const hotelRouter = express.Router();

// hotelRouter.get("/", getAllHotels);
// hotelRouter.get("/:id", getHotelById);
// hotelRouter.post("/", createHotel);
// hotelRouter.delete("/:id", deleteHotel);
// hotelRouter.put("/:id", updateHotel);

hotelRouter.route("/").get(getAllHotels).post(createHotel);
hotelRouter
    .route("/:id")
    .get(getHotelById)
    .put(updateHotel)
    .delete(deleteHotel);

export default hotelRouter;
