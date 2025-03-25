"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateResonse = exports.updateHotel = exports.deleteHotel = exports.createHotel = exports.getHotelById = exports.getAllHotels = void 0;
const Hotel_1 = __importDefault(require("../infastructure/schemas/Hotel"));
const not_found_error_1 = __importDefault(require("../domain/errors/not-found-error"));
const validation_error_1 = __importDefault(require("../domain/errors/validation-error"));
const hotel_1 = require("../domain/dtos/hotel");
const openai_1 = __importDefault(require("openai"));
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
const getAllHotels = async (req, res, next) => {
    try {
        const hotels = await Hotel_1.default.find();
        //await sleep(500);
        res.status(200).json(hotels);
        //res.status(400).json(hotels);
        return;
    }
    catch (error) {
        next(error);
    }
};
exports.getAllHotels = getAllHotels;
const getHotelById = async (req, res, next) => {
    try {
        const hotelId = req.params.id;
        //const hotel = hotels.find((hotel) => hotel._id === hotelId)
        const hotel = await Hotel_1.default.findById(hotelId);
        if (!hotel) {
            throw new not_found_error_1.default("Hotel not found");
            return;
        }
        res.status(200).json(hotel);
        return;
    }
    catch (error) {
        next(error);
    }
};
exports.getHotelById = getHotelById;
const createHotel = async (req, res, next) => {
    try {
        const hotel = hotel_1.CreateHotelDTO.safeParse(req.body);
        if (!hotel.success) { // Fixed spelling mistake
            throw new validation_error_1.default(hotel.error.message);
        }
        await Hotel_1.default.create({
            name: hotel.data.name,
            location: hotel.data.location, // Fixed incorrect property assignment
            image: hotel.data.image,
            price: hotel.data.price, // Ensuring proper parsing
            description: hotel.data.description,
        });
        // Return response
        res.status(201).send();
    }
    catch (error) {
        next(error);
    }
};
exports.createHotel = createHotel;
const deleteHotel = async (req, res) => {
    try {
        const hotelId = req.params.id;
        await Hotel_1.default.findByIdAndDelete(hotelId);
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
    }
    catch (error) {
    }
};
exports.deleteHotel = deleteHotel;
const updateHotel = async (req, res) => {
    try {
        const hotelId = req.params.hotelId;
        const updatedHotel = req.body;
        // Validate the request data
        if (!updatedHotel.name ||
            !updatedHotel.location ||
            !updatedHotel.image ||
            !updatedHotel.price ||
            !updatedHotel.description) {
            throw new validation_error_1.default("Inavlid hotel data");
        }
        await Hotel_1.default.findByIdAndUpdate(hotelId, updatedHotel);
        // Return the response
        res.status(200).send();
        return;
    }
    catch (error) {
    }
};
exports.updateHotel = updateHotel;
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
const generateResonse = async (req, res, next) => {
    const { prompt } = req.body; // Fixed typo
    const openai = new openai_1.default({
        apiKey: process.env.OPEN_API_KEY,
    });
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are an assistant. Categorize the words that a user gives, assign labels, and show an output. Return this response as the following examples: user:Lake,cat,Dog,Tree; response:[{lable:Nature,words:['Lake','Tree'}] {label:Aniamls,words:['Cat','Dog']}",
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
    }
    catch (error) {
        next(error);
    }
};
exports.generateResonse = generateResonse;
//# sourceMappingURL=hotel.js.map