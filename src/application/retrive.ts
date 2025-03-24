
import { Request, Response, NextFunction } from "express";
import Hotel from "../infastructure/schemas/Hotel";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import mongoose from "mongoose";
export const retrieve = async(
    req:Request,
    res:Response,
    next:NextFunction
) => {
    try {
        const {query} = req.query;
        if(!query ||query  === "" ){
            const hotels = ( await Hotel.find()).map((hotel)=>({
                hotel:hotel,
                confidence:1,
            }));
             res.status(200).json(hotels);
            return;
        }

        const embeddingsModel = new OpenAIEmbeddings({
            model:"text-embedding-ada-002",
            apiKey:process.env.OPEN_API_KEY,
        });

        const vectorIndex = new MongoDBAtlasVectorSearch(embeddingsModel,{
            collection:mongoose.connection.collection("hotelVector"),
            indexName:"vector_index",
        });

        const results = await vectorIndex.similaritySearchWithScore(query as string);

        console.log(results);

        
        
        const matchedHotels = await Promise.all(
            results.map(async (result)=> {
                const hotel = await Hotel.findById(result[0].metadata._id);
                return{
                    hotel:hotel,
                    confidence : result[1],
                };
            })
        );
        res.status(200).json(matchedHotels.length > 3 ? matchedHotels.slice(0,4) : matchedHotels);
        return;

    } catch (error) {
        
    }
}