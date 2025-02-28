import { NextFunction, Request , Response } from "express";
import Booking from "../infastructure/schemas/Booking"

export const createBooking = async(req : Request ,res : Response , next : NextFunction) => {
    try {
        const booking = req.body;
    //validate this data
    if(
        !booking.hotelId ||
        !booking.userId ||
        !booking.checkIn ||
        !booking.checkout||
        !booking.roomNumber
    ) {
        res.status(400).send();
        return;
    }
    //Add the booking
    await Booking.create({
        hotelId: booking.hotelId,
        userId: booking.userId,
        checkIn:booking.checkIn,
        checkout:booking.checkout,
        roomNumber:booking.roomNumber,
    });

    //return the response
    res.status(201).send();
    return;
    } catch (error) {
        next(error);
    }
    
};

export const getAllBookingsForHotel = async (req :Request, res :Response ,next : NextFunction) => {
    try {
        const hotelId = req.params.hotelId;
        const bookings = await Booking.find({ hotelId: hotelId }).populate("userId");
      
        res.status(200).json(bookings);
        return; 
    } catch (error) {
        next(error);
    }
    
  };
  
  export const getAllBookings = async (req :Request, res : Response ,next : NextFunction) => {
    try {
        const bookings = await Booking.find();
        res.status(200).json(bookings);
        return;
    } catch (error) {
       next(error);
    }
  };