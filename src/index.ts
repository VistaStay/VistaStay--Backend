import express from "express";
import cors from 'cors';

import 'dotenv/config';
import connectDB from "./infastructure/db";
import hotelRouter from "./api/hotel";
import userRouter from "./api/user";
import bookingRouter from "./api/booking";
import globalErrorHandlingMiddleware from "./api/middlewares/global-error-handlig-middleware";

const app = express();
app.use(express.json());
app.use(cors());
connectDB();

app.use("/api/hotels",hotelRouter)
app.use("/api/users",userRouter)
app.use("/api/bookings",bookingRouter)
app.use(globalErrorHandlingMiddleware)

app.listen(8080, () => {
  console.log("server is running on port 8080");
});



