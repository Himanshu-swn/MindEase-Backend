import express from "express";
import { authenticate } from "./../auth/verifyToken.js";
import { getCheckoutSession } from "../Controllers/bookingcontroller.js";
import Booking from "../models/Booking.js";

const router = express.Router();

router.post("/checkout-session/:doctorId", authenticate, getCheckoutSession);

// Get appointments for logged-in user (patient)
// Get appointments for a patient
router.get("/user", async (req, res) => {
  try {
    const userId = req.query.id;
    if (!userId)
      return res.status(400).json({ message: "User ID is required" });

    const bookings = await Booking.find({ user: userId });
    res.status(200).json(bookings);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch user appointments", error: err });
  }
});

// Get appointments for a doctor
router.get("/doctor", async (req, res) => {
  try {
    const doctorId = req.query.id;
    if (!doctorId)
      return res.status(400).json({ message: "Doctor ID is required" });

    const bookings = await Booking.find({ doctor: doctorId });
    res.status(200).json(bookings);
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Failed to fetch doctor appointments", error: err });
  }
});

export default router;
