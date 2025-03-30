console.log("Starting the application");

import express from "express";
import cors from "cors";
import "dotenv/config";
import { handleWebhook } from "./application/payment";
import bodyParser from "body-parser";
import paymentsRouter from "./api/payment";
import connectDB from "./infastructure/db"; // Note: Check if "infastructure" is a typo for "infrastructure"
import hotelRouter from "./api/hotel";
import userRouter from "./api/user";
import bookingRouter from "./api/booking";
import globalErrorHandlingMiddleware from "./api/middlewares/global-error-handlig-middleware"; // Typo: Should be "global-error-handling-middleware"
import { clerkMiddleware } from "@clerk/express";

console.log("Imports completed");

const app = express();

console.log("Express app created");

// Middleware setup
app.use(express.json());
app.use(clerkMiddleware());
app.use(cors({
  origin: "https://hotelapp-vistastay-frontend-sharada.netlify.app",
}));

// Connect to the database
connectDB()
  .then(() => console.log("Database connected successfully"))
  .catch((err) => {
    console.error("Database connection failed:", err);
    process.exit(1);
  });

console.log("Middleware and DB connection setup completed");

// Route handling
app.use("/api/hotels", hotelRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/users", userRouter);

// Stripe webhook handling
app.post(
  "/api/stripe/webhook",
  bodyParser.raw({ type: "application/json" }),
  handleWebhook
);

// Global error handling middleware
app.use(globalErrorHandlingMiddleware);

console.log("Routes and middleware fully configured");

// Export the app for Vercel
module.exports = app;