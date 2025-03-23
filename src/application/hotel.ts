import { NextFunction, Request , Response } from "express";

import Hotel from "../infastructure/schemas/Hotel";
import NotFoundError from "../domain/errors/not-found-error";
import ValidationError from "../domain/errors/validation-error";
import { CreateHotelDTO } from "../domain/dtos/hotel";
import OpenAI from "openai";

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

    if (!hotel.success) { 
      throw new ValidationError(hotel.error.message);
    }

    await Hotel.create({
      name: hotel.data.name,
      location: hotel.data.location,
      image: hotel.data.image,
<<<<<<< Updated upstream
      price: hotel.data.price ,
=======
      price: hotel.data.price ,// Ensuring proper parsing
>>>>>>> Stashed changes
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


//implement chgpt API
// export const generateResonse= async(
//   req:Request,
//   res:Response,
//   next:NextFunction
// ) => {
//   const {prompt} = req.body;

//   const openai = new OpenAI({
//     apiKey:process.env.OPEN_API_KEY,
//   });
//   const completion = await openai.chat.completions.create({
//     model: "gpt-4o",
//     messages: [
//         {
//             role: "system",
//             content: "You are a helpful assistant",
//         },
//         {
//           role: "user",
//             content: prompt,
//         }
//     ],
//     store:true,
// });

//   console.log(completion.choices[0].message);
//   res.status(200).json({message:completion.choices[0].message.content});
//   return;
// }


//conversational system
// export const generateResonse= async(
//   req:Request,
//   res:Response,
//   next:NextFunction
// ) => {
//   const {messages} = req.body;

//   const openai = new OpenAI({
//     apiKey:process.env.OPEN_API_KEY,
//   });
//   const completion = await openai.chat.completions.create({
//     model: "gpt-4o",
//     messages:
//       messages.length === 1
//       ?[
//         {
//           role:"system",
//           content:"youa are the assitent that works as a reciptionist in on role and you are going to talk to usrs and help them find the right entertaitment",
//         },
//         ...messages,
//       ]
//       : messages,
//     store:true,
// });

// res.status(200).json({
//   messages:[
//     ...messages,
//     {role : "assistant" , content : completion.choices[0].message.content},
//   ]
// })
// }

//system prompot
// export const generateResonse = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const { prompt } = req.body; // Fixed typo

//   const openai = new OpenAI({
//     apiKey: process.env.OPEN_API_KEY,
//   });

//   try {
//     const completion = await openai.chat.completions.create({
//       model: "gpt-4o",
//       messages: [
//         {
//           role: "system",
//           content:
//             "You are an assistant. Categorize the words that a user gives, assign labels, and show an output. Return this response as the following example: user:Lake,cat,Dog,Tree response:[{lable:Nature,words:['Lake','Tree'}] {label:Aniamls,words:['Cat','Dog']}",
//         },
//         { role: "user", content: prompt }, // Fixed typo
//       ],
//     });

//     res.status(200).json({
//       messages: {
//         role: "assistant", // Fixed typo
//         content: completion.choices[0]?.message?.content || "No response",
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

//few shot prompt
export const generateResonse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { prompt } = req.body; // Fixed typo

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
            "You are an assistant. Categorize the words that a user gives, assign labels, and show an output. Return this response as the following examples: user:Lake,cat,Dog,Tree; response:[{lable:Nature,words:['Lake','Tree'}] {label:Aniamls,words:['Cat','Dog']}",
        },
        { role: "user", content: prompt }, // Fixed typo
      ],
    });

    res.status(200).json({
      messages: {
        role: "assistant", // Fixed typo
        content: completion.choices[0]?.message?.content || "No response",
      },
    });
  } catch (error) {
    next(error);
  }
};

