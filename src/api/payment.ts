import express from "express";
import {
  createCheckoutSession,
  handleWebhook,
  retrieveSessionStatus,
} from "../application/payment";
import bodyParser from "body-parser";
import { isAuthenticated } from "./middlewares/authentication-middleware";
const paymentsRouter = express.Router();

paymentsRouter
  .route("/create-checkout-session")
  .post(isAuthenticated, createCheckoutSession);
paymentsRouter
  .route("/session-status")
  .get(isAuthenticated, retrieveSessionStatus);

export default paymentsRouter;