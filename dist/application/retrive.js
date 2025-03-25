"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieve = void 0;
const Hotel_1 = __importDefault(require("../infastructure/schemas/Hotel"));
const openai_1 = require("@langchain/openai");
const mongodb_1 = require("@langchain/mongodb");
const mongoose_1 = __importDefault(require("mongoose"));
const retrieve = async (req, res, next) => {
    try {
        const { query } = req.query;
        if (!query || query === "") {
            const hotels = (await Hotel_1.default.find()).map((hotel) => ({
                hotel: hotel,
                confidence: 1,
            }));
            res.status(200).json(hotels);
            return;
        }
        const embeddingsModel = new openai_1.OpenAIEmbeddings({
            model: "text-embedding-ada-002",
            apiKey: process.env.OPEN_API_KEY,
        });
        const vectorIndex = new mongodb_1.MongoDBAtlasVectorSearch(embeddingsModel, {
            collection: mongoose_1.default.connection.collection("hotelVector"),
            indexName: "vector_index",
        });
        const results = await vectorIndex.similaritySearchWithScore(query);
        console.log(results);
        const matchedHotels = await Promise.all(results.map(async (result) => {
            const hotel = await Hotel_1.default.findById(result[0].metadata._id);
            return {
                hotel: hotel,
                confidence: result[1],
            };
        }));
        res.status(200).json(matchedHotels.length > 3 ? matchedHotels.slice(0, 4) : matchedHotels);
        return;
    }
    catch (error) {
    }
};
exports.retrieve = retrieve;
//# sourceMappingURL=retrive.js.map