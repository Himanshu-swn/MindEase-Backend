import User from "../models/UserSchema.js";
import Booking from "../models/BookingSchema.js";
import Doctor from "../models/DoctorSchema.js";
//models
export const updateUser = async (req, res) => {
  const id = req.params.id;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "successfully updated",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update",
    });
  }
};
export const deleteUser = async (req, res) => {
  const id = req.params.id;

  try {
    await User.findByIdAndUpdate(id);

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
export const getSingleUser = async (req, res) => {
  const id = req.params.id;

  try {
    const user = await User.findById(id).select("-password");

    res.status(200).json({
      success: true,
      message: "User founded",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "No user found",
    });
  }
};
export const getAllUser = async (req, res) => {
  const id = req.params.id;

  try {
    //exclude password in data
    const users = await User.find({}).select("-password");

    res.status(200).json({
      success: true,
      message: "Here is users",
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Not update",
    });
  }
};

export const getUserProfile = async (req, res) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
    }

    const { password, ...rest } = user._doc;

    res.status(200).json({
      success: true,
      message: "Successfully ",
      data: { ...rest },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Something went wrong! cannot get!" });
  }
};

export const getMyAppointments = async (req, res) => {
  try {
    //retreiev appointment from booking
    const bookings = await Booking.find({ user: req.userId });
    //extract doctorid fr,m appointment booking
    const doctorIds = bookings.map((el) => el.doctor.id);

    //get data data from doctor id
    const doctors = await Doctor.find({ _id: { $in: doctorIds } }).select(
      "-password"
    );

    res.status(200).json({ success: true, message: "Success", data: doctors });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong! cannot get!",
    });
  }
};
