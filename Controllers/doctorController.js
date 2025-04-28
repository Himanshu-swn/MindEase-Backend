import Doctor from "../models/DoctorSchema.js";
import Booking from "../models/BookingSchema.js";
//models
export const updateDoctor = async (req, res) => {
  const id = req.params.id;

  try {
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "successfully updated",
      data: updatedDoctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update",
    });
  }
};
export const deleteDoctor = async (req, res) => {
  const id = req.params.id;

  try {
    await Doctor.findByIdAndUpdate(id);

    res.status(200).json({
      success: true,
      message: "successfully deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete",
    });
  }
};
export const getSingleDoctor = async (req, res) => {
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
};
export const getAllDoctor = async (req, res) => {
  try {
    //when search doctor
    const { query } = req.query;
    let doctors;

    if (query) {
      // Search based on doctor name or specialization
      doctors = await Doctor.find({
        isApproved: "approved",
        $or: [
          { name: { $regex: query, $options: "i" } },
          // Case-insensitive regex search on the name field
          { specialization: { $regex: query, $options: "i" } },
        ],
      }).select("-password");
    } else {
      //query doesnt exist find all doctos
      doctors = await Doctor.find({ isApproved: "approved" }).select(
        "-password"
      );
    }

    //exclude password in data

    res.status(200).json({
      success: true,
      message: "Here is doctors",
      data: doctors,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "Not update",
    });
  }
};

export const getDoctorProfile = async (req, res) => {
  const userId = req.userId;

  try {
    // let user = null;
    const user = await Doctor.findById(userId);

    if (!user) {
      res.status(404).json({ message: "Doctor not found" });
    }

    const appointments = await Booking.find({ doctor: userId });

    const { password, ...rest } = user._doc;

    res.status(200).json({
      success: true,
      message: "Successfully ",
      data: { ...rest, appointments },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Something went wrong! cannot get!" });
  }
};
