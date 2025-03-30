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

// Configure CORS to allow your frontend domain
const corsOptions = {
  origin: "https://hotelapp-vistastay-frontend-sharada.netlify.app",
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type, Authorization",
  credentials: true
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight OPTIONS requests
app.options("*", cors(corsOptions));

// Other middleware
app.use(express.json());
app.use(clerkMiddleware());

// Database connection middleware
const connectWithRetry = async () => {
  try {
    await connectDB();
    console.log("Database connected successfully");
  } catch (err) {
    console.error("Database connection failed:", err);
    throw new Error("Failed to connect to database");
  }
};

const dbConnectionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  connectWithRetry()
    .then(() => next())
    .catch((error) => next(error));
};

app.use(dbConnectionMiddleware);

// Routes
app.use("/api/hotels", hotelRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/users", userRouter);

// Stripe webhook route (if needed)
app.post(
  "/api/stripe/webhook",
  bodyParser.raw({ type: "application/json" }),
  handleWebhook
);

// Global error handling middleware
app.use(globalErrorHandlingMiddleware);

// Export for Vercel serverless
export default app;
