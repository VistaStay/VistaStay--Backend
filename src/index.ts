import express from "express";
import cors from 'cors';
import 'dotenv/config';
import connectDB from "./infastructure/db";
import hotelRouter from "./api/hotel";
import userRouter from "./api/user";
import bookingRouter from "./api/booking";
import globalErrorHandlingMiddleware from "./api/middlewares/global-error-handlig-middleware";
import { clerkMiddleware } from "@clerk/express";

const app = express();
app.use(express.json());
app.use(clerkMiddleware());
app.use(cors());
connectDB();

app.use("/api/hotels",hotelRouter)
app.use("/api/users",userRouter)
app.use("/api/bookings",bookingRouter)
app.use(globalErrorHandlingMiddleware)

app.listen(8081, () => {
  console.log("server is running on port 8081");
});



