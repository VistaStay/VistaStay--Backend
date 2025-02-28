import { NextFunction, Request , Response } from "express";

import Hotel from "../infastructure/schemas/Hotel";
import NotFoundError from "../domain/errors/not-found-error";
import ValidationError from "../domain/errors/validation-error";

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



export const createHotel = async(req :Request, res:Response ,next : NextFunction) => {
  try {
    const hotel = req.body;

  // Validate the request data
  if (
    !hotel.name ||
    !hotel.location ||
    !hotel.rating ||
    !hotel.reviews ||
    !hotel.image ||
    !hotel.price ||
    !hotel.description
  ) {
   throw new ValidationError("Inavalid hotel data");
  }

   await Hotel.create({
    name:hotel.name,
    location:hotel.name,
    rating:parseFloat(hotel.rating),
    reviews:parseInt(hotel.reviews),
    image:hotel.image,
    price:parseInt(hotel.price),
    description:hotel.description
   })
  // //add the hotel
  //  hotels.push({
  //   _id : hotels.length + 1,
  //   name : hotel.name,
  //   location : hotel.location,
  //   rating : hotel.rating,
  //   reviews : hotel.reviews,
  //   image : hotel.image,
  //   price : hotel.price,
  //   description : hotel.description,
  //  });

   //Return the response
   res.status(201).send();
   return;
  } catch (error) {
    next(error);
  }
  
}

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
    !updatedHotel.rating ||
    !updatedHotel.reviews ||
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
