import express from "express";
import { getAllHotels, getHotelById, createHotel, deleteHotel, updateHotel } from "../application/hotel";
import { isAuthenticated } from "./middlewares/authentication-middleware";
import { isAdmin } from "./middlewares/authorization-middleware";

const hotelRouter = express.Router();

// hotelRouter.get("/", getAllHotels);
// hotelRouter.get("/:id", getHotelById);
// hotelRouter.post("/", createHotel);
// hotelRouter.delete("/:id", deleteHotel);
// hotelRouter.put("/:id", updateHotel);

hotelRouter.route("/").get(getAllHotels).post(isAuthenticated,isAdmin,createHotel);
hotelRouter
    .route("/:id")
    .get(getHotelById)
    .put(updateHotel)
    .delete(deleteHotel);

export default hotelRouter;
