import express from "express";
import cors from "cors";
import 'dotenv/config';
import { handleWebhook } from "./application/payment"; // Ensure this is correctly implemented
import bodyParser from "body-parser";
import paymentsRouter from "./api/payment";  // Verify export
import connectDB from "./infastructure/db"; // Verify if "infastructure" should be "infrastructure"
import hotelRouter from "./api/hotel";      // Verify export
import userRouter from "./api/user";        // Verify export
import bookingRouter from "./api/booking";  // Verify export
import globalErrorHandlingMiddleware from "./api/middlewares/global-error-handlig-middleware"; // Typo corrected
import { clerkMiddleware } from "@clerk/express";

const app = express();

// Middleware setup
app.use(express.json());
app.use(clerkMiddleware()); // Ensure Clerk is configured
app.use(cors({ 
  origin: "https://hotelapp-vistastay-frontend-sharada.netlify.app" // Match frontend URL
}));

// Connect to the database with error handling
connectDB().catch((err) => {
  console.error("Database connection failed:", err);
  process.exit(1); // Exit if connection fails
});

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

// Start the server
const PORT = process.env.PORT || 8090;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));