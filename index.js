import express from "express";
import 'dotenv/config';
import connectDB from './src/infastructure/db.js'
import hotelRouter from "./src/api/hotel.js";
const app = express();

app.use(express.json());

app.use("/api/hotels",hotelRouter)
connectDB();

app.listen(8080, () => {
  console.log("server is running on port 8000");
});

