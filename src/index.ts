import express from "express";
import cors from 'cors';
import 'dotenv/config';
import { handleWebhook } from "./application/payment";
import bodyParser from "body-parser";
import paymentsRouter from "./api/payment";
import connectDB from "./infastructure/db";
import hotelRouter from "./api/hotel";
import userRouter from "./api/user";
import bookingRouter from "./api/booking";
import globalErrorHandlingMiddleware from "./api/middlewares/global-error-handlig-middleware";
import { clerkMiddleware } from "@clerk/express";

const app = express();
app.use(express.json());
app.use(clerkMiddleware());
app.use(cors({ origin: "hotelapp-vistastay-frontend-sharada.netlify.app" }));
connectDB();

app.use("/api/hotels",hotelRouter)
app.use("/api/payments", paymentsRouter);
app.use("/api/bookings",bookingRouter)
app.use(globalErrorHandlingMiddleware)
app.post(
  "/api/stripe/webhook",
  bodyParser.raw({ type: "application/json" }),
  handleWebhook
);
const PORT = process.env.PORT || 8085;
app.listen(PORT,() => console.log(`server running on port${PORT}`))



