"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = void 0;
const User_1 = __importDefault(require("../infastructure/schemas/User"));
const createUser = async (req, res) => {
    const user = req.body;
    // Validate the request data
    if (!user.name || !user.email) {
        res.status(400).send();
        return;
    }
    // Add the user
    await User_1.default.create({
        name: user.name,
        email: user.email,
    });
    // Return the response
    res.status(201).send();
    return;
};
exports.createUser = createUser;
//# sourceMappingURL=user.js.map