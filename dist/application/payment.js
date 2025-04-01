"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveSessionStatus = exports.createCheckoutSession = exports.handleWebhook = void 0;
const util_1 = __importDefault(require("util"));
const Booking_1 = __importDefault(require("../infastructure/schemas/Booking"));
const strip_1 = __importDefault(require("../infastructure/strip"));
const Hotel_1 = __importDefault(require("../infastructure/schemas/Hotel"));
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL;
async function fulfillCheckout(sessionId) {
    console.log("Fulfilling Checkout Session " + sessionId);
    const checkoutSession = await strip_1.default.checkout.sessions.retrieve(sessionId, {
        expand: ["line_items"],
    });
    console.log(util_1.default.inspect(checkoutSession, false, null, true));
    const bookingId = checkoutSession.metadata?.bookingId;
    if (!bookingId) {
        throw new Error("Booking ID not found in session metadata");
    }
    const booking = await Booking_1.default.findById(bookingId).select('+paymentStatus');
    if (!booking) {
        throw new Error("Booking not found");
    }
    if (booking.paymentStatus === "PAID") {
        console.log(`Booking ${bookingId} already fulfilled. Skipping update.`);
        return;
    }
    if (booking.paymentStatus !== "PENDING") {
        throw new Error(`Booking ${bookingId} is not in a pending state`);
    }
    if (checkoutSession.payment_status === "paid") {
        const updatedBooking = await Booking_1.default.findByIdAndUpdate(bookingId, { paymentStatus: "PAID" }, { new: true, runValidators: true });
        if (!updatedBooking) {
            throw new Error("Failed to update booking status to PAID");
        }
        console.log(`Booking ${bookingId} successfully fulfilled. Payment status updated to PAID.`);
    }
    else {
        console.log(`Checkout Session ${sessionId} not paid (status: ${checkoutSession.payment_status}). No action taken.`);
    }
}
const handleWebhook = async (req, res) => {
    const payload = req.body;
    const sig = req.headers["stripe-signature"];
    let event;
    try {
        event = strip_1.default.webhooks.constructEvent(payload, sig, endpointSecret);
        if (event.type === "checkout.session.completed" ||
            event.type === "checkout.session.async_payment_succeeded") {
            await fulfillCheckout(event.data.object.id);
            res.status(200).send();
            return;
        }
    }
    catch (err) {
        res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        return;
    }
};
exports.handleWebhook = handleWebhook;
const createCheckoutSession = async (req, res) => {
    try {
        const bookingId = req.body.bookingId;
        if (!bookingId) {
            throw new Error("Booking ID is required");
        }
        console.log("body", req.body);
        const booking = await Booking_1.default.findById(bookingId);
        if (!booking) {
            throw new Error("Booking not found");
        }
        const hotel = await Hotel_1.default.findById(booking.hotelId);
        if (!hotel) {
            throw new Error("Hotel not found");
        }
        console.log("Hotel details:", hotel);
        if (!hotel.stripePriceId) {
            console.error(`Hotel ${hotel._id} is missing a Stripe price ID`);
            throw new Error("Stripe price ID is missing for this hotel. Please check your hotel setup.");
        }
        const checkIn = new Date(booking.checkIn);
        const checkOut = new Date(booking.checkOut);
        const numberOfNights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        const session = await strip_1.default.checkout.sessions.create({
            ui_mode: "embedded",
            line_items: [{
                    price: hotel.stripePriceId,
                    quantity: numberOfNights,
                }],
            mode: "payment",
            return_url: `${FRONTEND_URL}/booking/complete?session_id={CHECKOUT_SESSION_ID}`,
            metadata: {
                bookingId: bookingId,
            },
        });
        res.send({ clientSecret: session.client_secret });
    }
    catch (error) {
        console.error("Error creating checkout session:", error);
        res.status(500).json({
            message: "Failed to create checkout session",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};
exports.createCheckoutSession = createCheckoutSession;
const retrieveSessionStatus = async (req, res) => {
    try {
        const sessionId = req.query.session_id;
        if (!sessionId) {
            throw new Error("Session ID is required");
        }
        const checkoutSession = await strip_1.default.checkout.sessions.retrieve(sessionId);
        if (!checkoutSession.metadata?.bookingId) {
            throw new Error("Booking ID not found in session metadata");
        }
        const booking = await Booking_1.default.findById(checkoutSession.metadata.bookingId);
        if (!booking) {
            throw new Error("Booking not found");
        }
        const hotel = await Hotel_1.default.findById(booking.hotelId);
        if (!hotel) {
            throw new Error("Hotel not found");
        }
        res.status(200).json({
            bookingId: booking._id,
            booking: booking,
            hotel: hotel,
            status: checkoutSession.status,
            customer_email: checkoutSession.customer_details?.email,
            paymentStatus: booking.paymentStatus,
        });
    }
    catch (error) {
        console.error("Error retrieving session status:", error);
        res.status(500).json({ message: "Failed to retrieve session status", error: error instanceof Error ? error.message : "Unknown error" });
    }
};
exports.retrieveSessionStatus = retrieveSessionStatus;
//# sourceMappingURL=payment.js.map