"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmbeddings = void 0;
const mongodb_1 = require("@langchain/mongodb"); // Correct import
const mongoose_1 = __importDefault(require("mongoose"));
const Hotel_1 = __importDefault(require("../infastructure/schemas/Hotel")); // Check path if needed
const openai_1 = require("@langchain/openai"); // Correct import
const documents_1 = require("@langchain/core/documents");
const createEmbeddings = async (req, res, next) => {
    try {
        const embeddingsModel = new openai_1.OpenAIEmbeddings({
            model: "text-embedding-ada-002",
            apiKey: process.env.OPENAI_API_KEY,
        });
        const vectorIndex = new mongodb_1.MongoDBAtlasVectorSearch(embeddingsModel, {
            collection: mongoose_1.default.connection.collection("hotelVector"),
            indexName: "vector_index",
        });
        const hotels = await Hotel_1.default.find({}); // Fixed typo: "hotel" -> "hotels"
        const docs = hotels.map((hotel) => {
            const { _id, location, price, description } = hotel;
            const doc = new documents_1.Document({
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
    }
    catch (error) {
        next(error);
    }
};
exports.createEmbeddings = createEmbeddings;
//# sourceMappingURL=embedding.js.map