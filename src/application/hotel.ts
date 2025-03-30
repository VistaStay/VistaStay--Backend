import { NextFunction, Request, Response } from "express";
import Hotel from "../infastructure/schemas/Hotel";
import NotFoundError from "../domain/errors/not-found-error";
import ValidationError from "../domain/errors/validation-error";
import { CreateHotelDTO, HotelFilterDTO } from "../domain/dtos/hotel";
import OpenAI from "openai";
import mongoose from "mongoose";

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Retrieves all hotels from the database.
 */
export const getAllHotels = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hotels = await Hotel.find();
    res.status(200).json(hotels);
    return;
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves a hotel by its ID.
 */
export const getHotelById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hotelId = req.params.id;
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      throw new NotFoundError("Hotel not found");
    }
    res.status(200).json(hotel);
    return;
  } catch (error) {
    next(error);
  }
};

/**
 * Creates a new hotel.
 */
export const createHotel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hotel = CreateHotelDTO.safeParse(req.body);

    if (!hotel.success) {
      throw new ValidationError(hotel.error.message);
    }

    await Hotel.create({
      name: hotel.data.name,
      location: hotel.data.location,
      image: hotel.data.image,
      price: hotel.data.price,
      description: hotel.data.description,
      amenities: hotel.data.amenities || [],
    });

    res.status(201).send();
  } catch (error) {
    next(error);
  }
};

/**
 * Deletes a hotel by its ID.
 */
export const deleteHotel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hotelId = req.params.id;
    const hotel = await Hotel.findByIdAndDelete(hotelId);
    if (!hotel) {
      throw new NotFoundError("Hotel not found");
    }
    res.status(200).send();
    return;
  } catch (error) {
    next(error);
  }
};

/**
 * Updates a hotel by its ID.
 */
export const updateHotel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hotelId = req.params.id;
    const updatedHotel = req.body;

    if (
      !updatedHotel.name ||
      !updatedHotel.location ||
      !updatedHotel.image ||
      !updatedHotel.price ||
      !updatedHotel.description
    ) {
      throw new ValidationError("Invalid hotel data");
    }

    const hotel = await Hotel.findByIdAndUpdate(hotelId, updatedHotel, { new: true });
    if (!hotel) {
      throw new NotFoundError("Hotel not found");
    }

    res.status(200).send();
    return;
  } catch (error) {
    next(error);
  }
};

/**
 * Generates a response using OpenAI based on a prompt.
 */
export const generateResonse = async (req: Request, res: Response, next: NextFunction) => {
  const { prompt } = req.body;

  const openai = new OpenAI({
    apiKey: process.env.OPEN_API_KEY,
  });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an assistant. Categorize the words that a user gives, assign labels, and show an output. Return this response as the following examples: user:Lake,cat,Dog,Tree; response:[{label:Nature,words:['Lake','Tree']},{label:Animals,words:['Cat','Dog']}]",
        },
        { role: "user", content: prompt },
      ],
    });

    res.status(200).json({
      messages: {
        role: "assistant",
        content: completion.choices[0]?.message?.content || "No response",
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves hotels based on filter criteria such as location, price range, and amenities.
 * The amenities filter now uses $and with $regex for case-insensitive matching to fix the issue.
 */
export const getHotelsByFilters = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("Raw query parameters:", req.query);

    if (mongoose.connection.readyState !== 1) {
      throw new Error("MongoDB is not connected");
    }
    console.log("MongoDB connection state:", mongoose.connection.readyState);

    const filter = HotelFilterDTO.safeParse(req.query);
    
    if (!filter.success) {
      console.error("Validation error:", filter.error.format());
      throw new ValidationError(JSON.stringify(filter.error.format()));
    }

    console.log("Parsed filter data:", filter.data);

    const query: any = {};

    // Location filter with regex for substring matching and case-insensitivity
    if (filter.data.locations && filter.data.locations.length > 0) {
      query.$or = filter.data.locations.map(loc => ({ location: { $regex: loc, $options: 'i' } }));
    }

    // Price range filter
    if (filter.data.minPrice || filter.data.maxPrice) {
      query.price = {};
      if (filter.data.minPrice !== undefined) query.price.$gte = filter.data.minPrice;
      if (filter.data.maxPrice !== undefined) query.price.$lte = filter.data.maxPrice;
    }

    // Amenities filter with case-insensitive matching
    if (filter.data.amenities && filter.data.amenities.length > 0) {
      const validAmenities = filter.data.amenities.filter(a => a && a.trim() !== '');
      if (validAmenities.length > 0) {
        query.$and = validAmenities.map(amenity => ({
          amenities: { $regex: amenity, $options: 'i' }
        }));
      }
    }

    console.log("MongoDB Query:", query);

    let hotels = await Hotel.find(query).catch(err => {
      console.error("MongoDB query error:", err);
      throw new Error(`MongoDB query failed: ${err.message}`);
    });

    // Sort hotels by price if specified
    if (filter.data.sort) {
      hotels.sort((a, b) => {
        const priceA = typeof a.price === 'number' ? a.price : 0;
        const priceB = typeof b.price === 'number' ? b.price : 0;
        return filter.data.sort === 'asc' ? priceA - priceB : priceB - priceA;
      });
    }

    console.log("Hotels found:", hotels.length);
    res.status(200).json(hotels);
    return;
  } catch (error) {
    console.error("Error in getHotelsByFilters:", error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : "Internal Server Error" 
    });
    return;
  }
};