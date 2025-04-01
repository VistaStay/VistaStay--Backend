"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHotelsByFilters = exports.generateResponse = exports.updateHotel = exports.deleteHotel = exports.createHotel = exports.getHotelById = exports.getAllHotels = void 0;
const Hotel_1 = __importDefault(require("../infastructure/schemas/Hotel"));
const not_found_error_1 = __importDefault(require("../domain/errors/not-found-error"));
const validation_error_1 = __importDefault(require("../domain/errors/validation-error"));
const hotel_1 = require("../domain/dtos/hotel");
const openai_1 = __importDefault(require("openai"));
const mongoose_1 = __importDefault(require("mongoose"));
const strip_1 = __importDefault(require("../infastructure/strip"));
const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};
/**
 * Retrieves all hotels from the database.
 */
const getAllHotels = async (req, res, next) => {
    try {
        const hotels = await Hotel_1.default.find();
        res.status(200).json(hotels);
        return;
    }
    catch (error) {
        next(error);
    }
};
exports.getAllHotels = getAllHotels;
/**
 * Retrieves a hotel by its ID.
 */
const getHotelById = async (req, res, next) => {
    try {
        const hotelId = req.params.id;
        const hotel = await Hotel_1.default.findById(hotelId);
        if (!hotel) {
            throw new not_found_error_1.default("Hotel not found");
        }
        res.status(200).json(hotel);
        return;
    }
    catch (error) {
        next(error);
    }
};
exports.getHotelById = getHotelById;
/**
 * Creates a new hotel with Stripe payment integration.
 */
const createHotel = async (req, res, next) => {
    try {
        // Validate input using Zod schema (CreateHotelDTO)
        const validationResult = hotel_1.CreateHotelDTO.safeParse(req.body);
        if (!validationResult.success) {
            throw new validation_error_1.default(validationResult.error.message);
        }
        const hotelData = validationResult.data;
        const priceInDollars = parseFloat(hotelData.price.toString());
        // Parse price to float and convert to cents for Stripe
        if (isNaN(priceInDollars)) {
            throw new validation_error_1.default("Price must be a valid number");
        }
        const priceInCents = Math.round(priceInDollars * 100);
        // Create a product in Stripe
        const stripeProduct = await strip_1.default.products.create({
            name: hotelData.name,
            description: hotelData.description,
            default_price_data: {
                unit_amount: priceInCents,
                currency: "usd",
            },
        });
        // Create the hotel with the Stripe price ID
        const hotel = await Hotel_1.default.create({
            name: hotelData.name,
            location: hotelData.location,
            image: hotelData.image,
            price: hotelData.price,
            description: hotelData.description,
            amenities: hotelData.amenities || [],
            stripePriceId: stripeProduct.default_price,
        });
        res.status(201).send();
    }
    catch (error) {
        next(error);
    }
};
exports.createHotel = createHotel;
/**
 * Deletes a hotel by its ID.
 */
const deleteHotel = async (req, res, next) => {
    try {
        const hotelId = req.params.id;
        const hotel = await Hotel_1.default.findByIdAndDelete(hotelId);
        if (!hotel) {
            throw new not_found_error_1.default("Hotel not found");
        }
        res.status(200).send();
        return;
    }
    catch (error) {
        next(error);
    }
};
exports.deleteHotel = deleteHotel;
/**
 * Updates a hotel by its ID.
 */
const updateHotel = async (req, res, next) => {
    try {
        const hotelId = req.params.id;
        const updatedHotel = req.body;
        if (!updatedHotel.name ||
            !updatedHotel.location ||
            !updatedHotel.image ||
            !updatedHotel.price ||
            !updatedHotel.description) {
            throw new validation_error_1.default("Invalid hotel data");
        }
        const hotel = await Hotel_1.default.findByIdAndUpdate(hotelId, updatedHotel, { new: true });
        if (!hotel) {
            throw new not_found_error_1.default("Hotel not found");
        }
        res.status(200).send();
        return;
    }
    catch (error) {
        next(error);
    }
};
exports.updateHotel = updateHotel;
/**
 * Generates a response using OpenAI based on a prompt.
 */
const generateResponse = async (req, res, next) => {
    const { prompt } = req.body;
    const openai = new openai_1.default({
        apiKey: process.env.OPEN_API_KEY,
    });
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are an assistant. Categorize the words that a user gives, assign labels, and show an output. Return this response as the following examples: user:Lake,cat,Dog,Tree; response:[{label:Nature,words:['Lake','Tree']},{label:Animals,words:['Cat','Dog']}]",
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
    }
    catch (error) {
        next(error);
    }
};
exports.generateResponse = generateResponse;
/**
 * Retrieves hotels based on filter criteria such as location, price range, and amenities.
 * The amenities filter now uses $and with $regex for case-insensitive matching to fix the issue.
 */
const getHotelsByFilters = async (req, res, next) => {
    try {
        console.log("Raw query parameters:", req.query);
        if (mongoose_1.default.connection.readyState !== 1) {
            throw new Error("MongoDB is not connected");
        }
        console.log("MongoDB connection state:", mongoose_1.default.connection.readyState);
        const filter = hotel_1.HotelFilterDTO.safeParse(req.query);
        if (!filter.success) {
            console.error("Validation error:", filter.error.format());
            throw new validation_error_1.default(JSON.stringify(filter.error.format()));
        }
        console.log("Parsed filter data:", filter.data);
        const query = {};
        // Location filter with regex for substring matching and case-insensitivity
        if (filter.data.locations && filter.data.locations.length > 0) {
            query.$or = filter.data.locations.map(loc => ({ location: { $regex: loc, $options: 'i' } }));
        }
        // Price range filter
        if (filter.data.minPrice || filter.data.maxPrice) {
            query.price = {};
            if (filter.data.minPrice !== undefined)
                query.price.$gte = filter.data.minPrice;
            if (filter.data.maxPrice !== undefined)
                query.price.$lte = filter.data.maxPrice;
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
        let hotels = await Hotel_1.default.find(query).catch(err => {
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
    }
    catch (error) {
        console.error("Error in getHotelsByFilters:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Internal Server Error"
        });
        return;
    }
};
exports.getHotelsByFilters = getHotelsByFilters;
//# sourceMappingURL=hotel.js.map