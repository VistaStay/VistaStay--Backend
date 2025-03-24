import express from "express";
import { getAllHotels, getHotelById, createHotel, deleteHotel, updateHotel, generateResonse } from "../application/hotel";
import { isAuthenticated } from "./middlewares/authentication-middleware";
import { isAdmin } from "./middlewares/authorization-middleware";
<<<<<<< HEAD
=======
import { createEmbeddings } from "./embedding";
import { retrieve } from "../application/retrive";


>>>>>>> test7

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
<<<<<<< HEAD

hotelRouter.route("/llm").post(generateResonse);
=======
hotelRouter.route("/llm").post(generateResonse);
hotelRouter.route("/embeddings/create").post(createEmbeddings);
hotelRouter.route("/search/retrive").get(retrieve);
>>>>>>> test7
export default hotelRouter;
