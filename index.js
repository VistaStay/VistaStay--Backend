import express from "express";
import cors from 'cors';

import 'dotenv/config';
import connectDB from './src/infastructure/db.js'
import hotelRouter from "./src/api/hotel.js";
import userRouter from "./src/api/user.js";
import bookingRouter from "./src/api/booking.js";
const app = express();
app.use(express.json());
app.use(cors());
app.use("/api/hotels",hotelRouter)
app.use("/api/users",userRouter)
app.use("/api/bookings",bookingRouter)
connectDB();

app.listen(8080, () => {
  console.log("server is running on port 8000");
});



