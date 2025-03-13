import { NextFunction, Request , Response } from "express";
import OpenAI from "openai";
import Hotel from "../infastructure/schemas/Hotel";
import NotFoundError from "../domain/errors/not-found-error";
import ValidationError from "../domain/errors/validation-error";
import { CreateHotelDTO } from "../domain/dtos/hotel";
import { GoogleGenerativeAI } from "@google/generative-ai";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getAllHotels = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const hotels = await Hotel.find();
    res.status(200).json(hotels);
    return;
  } catch (error) {
    next(error);
  }
};

export const getHotelById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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


export const createHotel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const hotel = CreateHotelDTO.safeParse(req.body);
    // Validate the request data

    if (!hotel.success) {
      throw new ValidationError(hotel.error.message);
    }

    // Add the hotel
    await Hotel.create({
      name: hotel.data.name,
      location: hotel.data.location,
      image: hotel.data.image,
      price: parseInt(hotel.data.price),
      description: hotel.data.description,
    });

    // Return the response
    res.status(201).send();
    return;
  } catch (error) {
    next(error);
  }
};

export const deleteHotel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const hotelId = req.params.id;
    await Hotel.findByIdAndDelete(hotelId);

    // Return the response
    res.status(200).send();
    return;
  } catch (error) {
    next(error);
  }
};

export const updateHotel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
      throw new ValidationError("Invalid hotel data");
    }

    await Hotel.findByIdAndUpdate(hotelId, updatedHotel);

    // Return the response
    res.status(200).send();
    return;
  } catch (error) {
    next(error);
  }
};

// export const generateResponse = async (
//   req:Request,
//   res:Response,
//   next:NextFunction
// ) => {

//   const {prompt } = req.body;

//   const openai = new OpenAI({
//     apiKey:process.env.OPENAI_API_KEY,
//   });
//   const completion = await openai.chat.completions.create({
//     model: "gpt-4o",
//     messages: [
//         { role: "system", content: "You are a helpful assistant." },
//         {
//             role: "user",
//             content: prompt,
//         },
//     ],
//     store: true,
// });

// console.log(completion.choices[0].message);
// }






// export const generateResponse = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { prompt } = req.body;

//     if (!prompt) {
//       return res.status(400).json({ error: "Prompt is required." });
//     }

//     const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
//     const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

//     const response = await model.generateContent(prompt);
//     const text = response.response.text(); // Extract the response text

//     res.status(200).json({ response: text });
//   } catch (error: any) {
//     console.error("Gemini API Error:", error);
//     res.status(500).json({ message: "Internal Server Error", details: error.message });
//   }
// };





// const apiKey = process.env.GEMINI_API_KEY;

// if (!apiKey) {
//   throw new Error("GEMINI_API_KEY is not defined in the environment variables");
// }

// const genAI = new GoogleGenerativeAI(apiKey);
// const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// export const chatbot = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { prompt, message } = req.body;

//     // Validate if message is provided correctly
//     if (!Array.isArray(message) || message.length === 0) {
//       return res.status(400).json({ message: "Missing or invalid message array" });
//     }

//     // Format the message for the generative AI model
//     const formattedMessages = message.map((msg: { role: string; content: string }) => ({
//       role: msg.role,
//       parts: [{ text: msg.content }],
//     }));

//     // Avoid duplicate consecutive user messages
//     if (message.length > 0 && message[message.length - 1].role === "user") {
//       message.pop();
//     }

//     // Generate content using the model
//     const completion = await model.generateContent({
//       contents: formattedMessages,
//     });

//     // Extract the generated response from the model
//     const aiMessage = completion?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";

//     // Send the response back to the client, excluding the prompt
//     res.status(200).json({
//       message: [
//         ...message,
//         { role: "assistant", content: aiMessage },
//       ],
//     });
//   } catch (error: any) {
//     console.error("Chatbot Error", error);
//     res.status(500).json({ message: "Internal Server Error", details: error.message });
//   }
// };







// const apiKey = process.env.GEMINI_API_KEY;

// if (!apiKey) {
//   throw new Error("GEMINI_API_KEY is not defined in the environment variables");
// }

// const genAI = new GoogleGenerativeAI(apiKey);
// const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// export const chatbot = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { prompt, message } = req.body;

//     // Validate if message is provided correctly
//     if (!Array.isArray(message) || message.length === 0) {
//       return res.status(400).json({ message: "Missing or invalid message array" });
//     }

//     // System prompt to define the assistant's role
//     const systemPrompt = "You are the assistant that works as a receptionist in a hotel, and you are going to talk to users and help them find the right entertainment options.";

//     // Format the message for the generative AI model
//     const formattedMessages = [
//       {
//         role: "user",
//         parts: [{ text: systemPrompt }],
//       },
//       ...message.map((msg: { role: string; content: string }) => ({
//         role: msg.role,
//         parts: [{ text: msg.content }],
//       })),
//     ];

//     // Avoid duplicate consecutive user messages
//     if (message.length > 0 && message[message.length - 1].role === "user") {
//       message.pop();
//     }

//     // Generate content using the model
//     const completion = await model.generateContent({
//       contents: formattedMessages,
//     });

//     // Extract the generated response from the model
//     const aiMessage = completion?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";

//     // Send the response back to the client, excluding the prompt
//     res.status(200).json({
//       message: [
//         ...message,
//         { role: "assistant", content: aiMessage },
//       ],
//     });
//   } catch (error: any) {
//     console.error("Chatbot Error", error);
//     res.status(500).json({ message: "Internal Server Error", details: error.message });
//   }
//};






// const apiKey = process.env.GEMINI_API_KEY;

// // Check if the API key is defined
// if (!apiKey) {
//   throw new Error("GEMINI_API_KEY is not defined in the environment variables");
// }

// // Initialize the generative AI model
// const genAI = new GoogleGenerativeAI(apiKey);
// const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// // Define the chatbot function
// export const chatbot = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { prompt } = req.body;

//     // Validate if the prompt is provided correctly
//     if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
//       return res.status(400).json({ message: "Missing or invalid prompt" });
//     }

//     // New system prompt to categorize words and assign labels
//     const systemPrompt = "You are an assistant that will categorize words that a user gives them labels and show an output. Return this response as the following example User: Lake,Cat,Dog,Tree; response:{{label:nature,words:['Lake','Tree']}, word:['Cat','Dog']}]";

//     // Format the message for the generative AI model
//     const formattedMessages = [
//       {
//         role: "user",
//         parts: [{ text: systemPrompt }],
//       },
//       {
//         role: "user",
//         parts: [{ text: `Please categorize the following words: ${prompt}` }],
//       },
//     ];

//     // Generate content using the model
//     const completion = await model.generateContent({
//       contents: formattedMessages,
//     });

//     // Extract the AI's response for the categorization
//     const aiMessage = completion?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";

//     // Send the response back to the client
//     res.status(200).json({
//       message: [
//         { role: "assistant", content: aiMessage },
//       ],
//     });
//   } catch (error: any) {
//     console.error("Chatbot Error", error);
//     res.status(500).json({ message: "Internal Server Error", details: error.message });
//   }
// };




const apiKey = process.env.GEMINI_API_KEY;

// Check if the API key is defined
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not defined in the environment variables");
}

// Initialize the generative AI model
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "tuning_job.tuned_model.model" });

// Define the chatbot function
export const chatbot = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { prompt } = req.body;

    // Validate if the prompt is provided correctly
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({ message: "Missing or invalid prompt" });
    }

    // New system prompt to categorize words and assign labels
    const systemPrompt = `
    You are an assistant that will categorize words that a user gives them labels and show an output. 
    Return the response in the following format: 
    
    Example 1:
    User: Lake,Cat,Dog,Tree;
    Response: { {label: 'nature', words: ['Lake', 'Tree']}, {label: 'animal', words: ['Cat', 'Dog']} }
    
    Example 2:
    User: Apple,Banana,Car,Dog,Tree;
    Response: { {label: 'fruit', words: ['Apple', 'Banana']}, {label: 'animal', words: ['Dog']}, {label: 'vehicle', words: ['Car']}, {label: 'nature', words: ['Tree']} }
    
    Example 3:
    User: Sun,Dog,Chair,Flower;
    Response: { {label: 'nature', words: ['Sun', 'Flower']}, {label: 'animal', words: ['Dog']}, {label: 'furniture', words: ['Chair']} }
    
    Now categorize the following words:
    User: ${prompt};
    Response:
    `;
    
    
    // Format the message for the generative AI model
    const formattedMessages = [
      {
        role: "user",
        parts: [{ text: systemPrompt }],
      },
      {
        role: "user",
        parts: [{ text: `Please categorize the following words: ${prompt}` }],
      },
    ];

    // Generate content using the model
    const completion = await model.generateContent({
      contents: formattedMessages,
    });

    // Extract the AI's response for the categorization
    const aiMessage = completion?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";

    // Send the response back to the client
    res.status(200).json({
      message: [
        { role: "assistant", content: aiMessage },
      ],
    });
  } catch (error: any) {
    console.error("Chatbot Error", error);
    res.status(500).json({ message: "Internal Server Error", details: error.message });
  }
};