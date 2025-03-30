import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
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

// Middleware setup
app.use(express.json());
app.use(clerkMiddleware());
app.use(cors({
  origin: 'https://hotelapp-vistastay-frontend-sharada.netlify.app'
}));

// Connect to the database with serverless-friendly handling
const connectWithRetry = async () => {
  try {
    await connectDB();
    console.log("Database connected successfully");
  } catch (err) {
    console.error("Database connection failed:", err);
    throw new Error("Failed to connect to database");
  }
};

// Middleware to ensure DB connection before handling requests
const dbConnectionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  connectWithRetry()
    .then(() => next())
    .catch((error) => next(error));
};

app.use(dbConnectionMiddleware);

// Route handling
app.use("/api/hotels", hotelRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/users", userRouter);

// Global error handling middleware
app.use(globalErrorHandlingMiddleware);

// Stripe webhook handling
app.post(
  "/api/stripe/webhook",
  bodyParser.raw({ type: "application/json" }),
  handleWebhook
);

// Export for Vercel serverless
export default app;