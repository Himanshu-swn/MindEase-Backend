import express from "express";
// import {
// updateDoctor,
// deleteDoctor,
// getSingleDoctor,
// getAllDoctor
// getDoctorProfile,
// } from "../Controllers/doctorController.js";

// import { authenticate, restrict } from "../auth/verifyToken.js";

import reviewRouter from "./review.js";
import Doctor from "../models/DoctorSchema.js";
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.status(200).json(doctors);
  } catch (err) {
    console.error("Error fetching doctors:", err.message);
    res.status(500).json({ message: "Failed to fetch doctors." });
  }
});

//nested route
// router.use("/:doctorId/reviews", reviewRouter);

router.get("/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const doctor = await Doctor.findById(id)
      .populate("reviews")
      .select("-password");

    res.status(200).json({
      success: true,
      message: "Doctor founded",
      data: doctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "No doctor found",
    });
  }
});
// router.get("/", getAllDoctor);

// router.put("/:id", updateDoctor);

// router.delete("/:id", deleteDoctor);

// router.get(`/profile/me`, restrict(["doctor"]), getDoctorProfile);

export default router;
