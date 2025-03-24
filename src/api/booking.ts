import {
  createBooking,
  getAllBookingsForHotel,
  getAllBookings,
} from "../application/booking";

import express from "express";
import { isAuthenticated } from "./middlewares/authentication-middleware";

const bookingsRouter = express.Router();

bookingsRouter.route("/").post(isAuthenticated,createBooking).get(getAllBookings);
bookingsRouter.route("/hotels/:hotelId").get(getAllBookingsForHotel);

export default bookingsRouter;