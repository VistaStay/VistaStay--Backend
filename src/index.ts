import 'dotenv/config';
import express from "express";
import connectDB from "./infastructure/db";
import { clerkMiddleware } from "@clerk/express";
import cors from 'cors';
import bookingRouter from "./api/booking";
import hotelRouter from "./api/hotel";
import globalErrorHandlingMiddleware from "./api/middlewares/global-error-handlig-middleware";
import { handleWebhook } from "./application/payment";
import bodyParser from "body-parser";
import paymentsRouter from "./api/payment";

const app = express();
app.use(clerkMiddleware());
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.post(
  "/api/stripe/webhook",
  bodyParser.raw({ type: "application/json" }),
  handleWebhook
);
app.use(express.json());
app.use("/api/hotels",hotelRouter)
app.use("/api/bookings",bookingRouter)
app.use("/api/payments", paymentsRouter);
app.use(globalErrorHandlingMiddleware)
connectDB();
app.listen(8083, () => {
  console.log("server is running on port 8083");
});



