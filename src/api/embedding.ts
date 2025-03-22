import { MongoDBAtlasVectorSearch } from "@langchain/mongodb"; // Correct import

import mongoose from "mongoose";
import Hotel from "../infastructure/schemas/Hotel"; // Check path if needed
import { NextFunction, Request, Response } from "express"; // Missing import for types
import { OpenAIEmbeddings } from "@langchain/openai"; // Correct import
import { Document } from "@langchain/core/documents";

export const createEmbeddings = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const embeddingsModel = new OpenAIEmbeddings({
            model: "text-embedding-ada-002",
            apiKey: process.env.OPENAI_API_KEY,
        });

        const vectorIndex = new MongoDBAtlasVectorSearch(embeddingsModel, {
            collection: mongoose.connection.collection("hotelVector"),
            indexName: "vector_index",
        });

        const hotels = await Hotel.find({}); // Fixed typo: "hotel" -> "hotels"

        const docs = hotels.map((hotel) => {
            const { _id, location, price, description } = hotel;
            const doc = new Document({
                pageContent: `${description} Located in ${location}. Price per night: ${price}`,
                metadata: {
                    _id,
                },
            });
            return doc;
        });

        await vectorIndex.addDocuments(docs);

        res.status(200).json({
            message: "Embedding created successfully",
        });
    } catch (error) {
        next(error);
    }
};
