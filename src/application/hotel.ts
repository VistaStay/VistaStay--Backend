// hotel.js
import { NextFunction, Request, Response } from "express";
import Hotel from "../infastructure/schemas/Hotel";
import NotFoundError from "../domain/errors/not-found-error";
import ValidationError from "../domain/errors/validation-error";
import { CreateHotelDTO } from "../domain/dtos/hotel";
import OpenAI from "openai";

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const getAllHotels = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hotels = await Hotel.find();
    res.status(200).json(hotels);
    return;
  } catch (error) {
    next(error);
  }
};

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
      amenities: hotel.data.amenities || [], // Store amenities if provided, otherwise an empty array
    });

    res.status(201).send();
  } catch (error) {
    next(error);
  }
};

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

export const updateHotel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hotelId = req.params.id;
    const updatedHotel = req.body;

    // Validate the request data
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