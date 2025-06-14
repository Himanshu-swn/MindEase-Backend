import User from "../models/UserSchema.js";
import Doctor from "../models/DoctorSchema.js";
import Booking from "../models/Booking.js";
import Stripe from "stripe";

export const getCheckoutSession = async (req, res) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    //get user and doctor
    const doctor = await Doctor.findById(req.params.doctorId);
    const user = await User.findById(req.userId);

    //create stripe checkout session

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${process.env.CLIENT_SITE_URL}/checkout-success`,
      cancel_url: `${req.protocol}://${req.get("host")}/doctor/${doctor.id}`,

      customer_email: user.email,
      client_reference_id: req.params.doctorId,
      line_items: [
        {
          price_data: {
            currency: "AUD",
            unit_amount: doctor.ticketPrice * 100,
            product_data: {
              name: doctor.name,
              description: doctor.bio,
              images: [doctor.photo],
            },
          },
          quantity: 1,
        },
      ],
    });

    // Create a booking object with the necessary details
    const booking = new Booking({
      doctor: doctor._id,
      user: user._id,
      ticketPrice: doctor.ticketPrice,
      session: session.id,
    });

    await booking.save();

    res.status(200).json({
      success: true,
      message: "successfully paid",
      session,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
