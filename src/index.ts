import express from "express";
import cors from 'cors';
import 'dotenv/config';
import paymentsRouter from "./api/payment";
import connectDB from "./infastructure/db";
import hotelRouter from "./api/hotel";
import userRouter from "./api/user";
import bookingRouter from "./api/booking";
import bodyParser from "body-parser";
import globalErrorHandlingMiddleware from "./api/middlewares/global-error-handlig-middleware";
import { clerkMiddleware } from "@clerk/express";
import { handleWebhook } from "./application/payment";
const app = express();
app.use(express.json());
app.use(clerkMiddleware());
app.use(cors({ origin: "https://hotelapp-vistastay-frontend-sharada.netlify.app/" }));
connectDB();
app.post(
  "/api/stripe/webhook",
  bodyParser.raw({ type: "application/json" }),
  handleWebhook
);
app.use("/api/hotels",hotelRouter)
app.use("/api/users",userRouter)
app.use("/api/bookings",bookingRouter)
app.use("/api/payments", paymentsRouter);
app.use(globalErrorHandlingMiddleware)

app.listen(8083, () => {
  console.log("server is running on port 8083");
});



