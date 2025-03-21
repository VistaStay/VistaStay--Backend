import { NextFunction, Request , Response } from "express";

import Hotel from "../infastructure/schemas/Hotel";
import NotFoundError from "../domain/errors/not-found-error";
import ValidationError from "../domain/errors/validation-error";
import { CreateHotelDTO } from "../domain/dtos/hotel";

const sleep = (ms:number) => {
  return new Promise(resolve => setTimeout(resolve,ms));
};


export const getAllHotels = async(req :Request, res : Response , next : NextFunction) => {
  try{
    const hotels = await Hotel.find();
    //await sleep(500);
    res.status(200).json(hotels);
    //res.status(400).json(hotels);
     return;
  } catch (error){
    next(error)
  }
  
};


export const getHotelById =  async(req :Request, res:Response , next : NextFunction) => {

  try {
    const hotelId = req.params.id;
     //const hotel = hotels.find((hotel) => hotel._id === hotelId)
    const hotel = await Hotel.findById(hotelId);
    if(!hotel){
      throw new NotFoundError("Hotel not found");
      return;
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

    if (!hotel.success) {  // Fixed spelling mistake
      throw new ValidationError(hotel.error.message);
    }

    await Hotel.create({
      name: hotel.data.name,
      location: hotel.data.location, // Fixed incorrect property assignment
      image: hotel.data.image,
      price:  parseInt(hotel.data.price) ,// Ensuring proper parsing
      description: hotel.data.description,
    });

    // Return response
    res.status(201).send();
  } catch (error) {
    next(error);
  }
};

export const deleteHotel =  async(req : Request, res :Response) => {
  try {
    const hotelId = req.params.id;
  await Hotel.findByIdAndDelete(hotelId);
  //validate the request
  // if(!hotels.find((hotel)=>hotel._id === hotelId)){
  //   res.status(404).send();
  //   return;
  // }

  //delete the hotel
  // hotels.splice(
  //   hotels.findIndex((hotel) => hotel._id === hotelId),
  // );

  res.status(200).send();
  return;
  } catch (error) {
    
  }
  
};

export const updateHotel = async (req :Request, res:Response) => {
  try {
    const hotelId = req.params.hotelId;
  const updatedHotel = req.body;

  // Validate the request data
  if (
    !updatedHotel.name ||
    !updatedHotel.location ||
    !updatedHotel.image ||
    !updatedHotel.price ||
    !updatedHotel.description
  ) {
   throw new ValidationError("Inavlid hotel data")
  }                                                                  

  await Hotel.findByIdAndUpdate(hotelId, updatedHotel);

  // Return the response
  res.status(200).send();
  return;
  } catch (error) {
    
  }
  
};
