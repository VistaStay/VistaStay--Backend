import express from "express";
import cors from "cors";
import 'dotenv/config';
import { handleWebhook } from "./application/payment"; // Make sure handleWebhook is correctly implemented
import bodyParser from "body-parser";
import paymentsRouter from "./api/payment";  // Make sure the routes are correct
import connectDB from "./infastructure/db"; // Correct directory name
import hotelRouter from "./api/hotel";
import userRouter from "./api/user"; // You may need this based on your structure
import bookingRouter from "./api/booking";
import globalErrorHandlingMiddleware from "./api/middlewares/global-error-handlig-middleware"; // Fix typo
import { clerkMiddleware } from "@clerk/express";

const app = express();

// Middleware setup
app.use(express.json());
app.use(clerkMiddleware()); // Clerk middleware for session handling
app.use(cors({ 
  origin: "https://hotelapp-vistastay-frontend-sharada.netlify.app" // Correct frontend URL for CORS
}));

// Connect to the database
connectDB();

// Route handling
app.use("/api/hotels", hotelRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/users", userRouter); // Add if necessary

// Global error handling middleware
app.use(globalErrorHandlingMiddleware);

// Stripe webhook handling
app.post(
  "/api/stripe/webhook",
  bodyParser.raw({ type: "application/json" }),
  handleWebhook
);

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
