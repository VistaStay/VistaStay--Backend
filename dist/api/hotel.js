"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const hotel_1 = require("../application/hotel");
const authentication_middleware_1 = require("./middlewares/authentication-middleware");
const authorization_middleware_1 = require("./middlewares/authorization-middleware");
const embedding_1 = require("./embedding");
const retrive_1 = require("../application/retrive");
const hotelRouter = express_1.default.Router();
hotelRouter.route("/").get(hotel_1.getAllHotels).post(authentication_middleware_1.isAuthenticated, authorization_middleware_1.isAdmin, hotel_1.createHotel);
// Specific routes should come before dynamic routes
hotelRouter.route("/llm").post(hotel_1.generateResponse);
hotelRouter.route("/embeddings/create").post(embedding_1.createEmbeddings);
hotelRouter.route("/search/retrive").get(retrive_1.retrieve);
hotelRouter.route("/filter").get(hotel_1.getHotelsByFilters);
// Dynamic route with :id should come last
hotelRouter
    .route("/:id")
    .get(hotel_1.getHotelById)
    .put(hotel_1.updateHotel)
    .delete(hotel_1.deleteHotel);
exports.default = hotelRouter;
//# sourceMappingURL=hotel.js.map