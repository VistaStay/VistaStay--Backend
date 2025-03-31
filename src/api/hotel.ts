import express from "express";
import { getAllHotels, getHotelById, createHotel, deleteHotel, updateHotel, getHotelsByFilters, generateResponse } from "../application/hotel";
import { isAuthenticated } from "./middlewares/authentication-middleware";
import { isAdmin } from "./middlewares/authorization-middleware";
import { createEmbeddings } from "./embedding";
import { retrieve } from "../application/retrive";

const hotelRouter = express.Router();

hotelRouter.route("/").get(getAllHotels).post(isAuthenticated, isAdmin, createHotel);

// Specific routes should come before dynamic routes
hotelRouter.route("/llm").post(generateResponse);
hotelRouter.route("/embeddings/create").post(createEmbeddings);
hotelRouter.route("/search/retrive").get(retrieve);
hotelRouter.route("/filter").get(getHotelsByFilters);

// Dynamic route with :id should come last
hotelRouter
    .route("/:id")
    .get(getHotelById)
    .put(updateHotel)
    .delete(deleteHotel);

export default hotelRouter;