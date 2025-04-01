import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
    try {
        const MONGODB_URL = process.env.MONGODB_URL;
        if (!MONGODB_URL) {
            throw new Error("MONGODB_URL is not set");
        }

        await mongoose.connect(MONGODB_URL); 

        console.log("Connected to the database........");
    } catch (error) {
        console.error("Error connecting to the database....", error);
    }
};

export default connectDB;
