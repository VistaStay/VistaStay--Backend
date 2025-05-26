import { Request, Response } from "express";
import util from "util";
import Booking from "../infastructure/schemas/Booking";
import stripe from "../infastructure/strip";
import Hotel from "../infastructure/schemas/Hotel";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
const FRONTEND_URL = process.env.FRONTEND_URL as string;

async function fulfillCheckout(sessionId: string) {
  console.log("Fulfilling Checkout Session " + sessionId);

  const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items"],
  });
  console.log(util.inspect(checkoutSession, false, null, true));

  const bookingId = checkoutSession.metadata?.bookingId;
  if (!bookingId) {
    throw new Error("Booking ID not found in session metadata");
  }

  const booking = await Booking.findById(bookingId).select('+paymentStatus');
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
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { paymentStatus: "PAID" },
      { new: true, runValidators: true }
    );

    if (!updatedBooking) {
      throw new Error("Failed to update booking status to PAID");
    }

    console.log(`Booking ${bookingId} successfully fulfilled. Payment status updated to PAID.`);
  } else {
    console.log(`Checkout Session ${sessionId} not paid (status: ${checkoutSession.payment_status}). No action taken.`);
  }
}

export const handleWebhook = async (req: Request, res: Response) => {
  const payload = req.body;
  const sig = req.headers["stripe-signature"] as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      await fulfillCheckout(event.data.object.id);
      res.status(200).send();
      return;
    }
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    return;
  }
};

export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const bookingId = req.body.bookingId;
    if (!bookingId) {
      throw new Error("Booking ID is required");
    }
    console.log("body", req.body);
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw new Error("Booking not found");
    }

    const hotel = await Hotel.findById(booking.hotelId);
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

    const session = await stripe.checkout.sessions.create({
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
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ 
      message: "Failed to create checkout session", 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
};

export const retrieveSessionStatus = async (req: Request, res: Response) => {
  try {
    const sessionId = req.query.session_id as string;
    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
    if (!checkoutSession.metadata?.bookingId) {
      throw new Error("Booking ID not found in session metadata");
    }

    const booking = await Booking.findById(checkoutSession.metadata.bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }
    
    const hotel = await Hotel.findById(booking.hotelId);
    if (!hotel) {
      throw new Error("Hotel not found");
    }

    res.status(200).json({
      bookingId: booking._id,
      booking: booking,
      hotel: hotel,
      status: checkoutSession.status,
      payment_status: checkoutSession.payment_status, // Added payment_status
      customer_email: checkoutSession.customer_details?.email,
      bookingPaymentStatus: booking.paymentStatus,   // Renamed to avoid confusion
    });
  } catch (error) {
    console.error("Error retrieving session status:", error);
    res.status(500).json({ 
      message: "Failed to retrieve session status", 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
};