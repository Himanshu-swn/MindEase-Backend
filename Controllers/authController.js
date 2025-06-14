import User from "../models/UserSchema.js";
import Doctor from "../models/DoctorSchema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

//model-manipulate data
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "15d",
    }
  );
};

export const register = async (req, res) => {
  const { email, password, name, role, photo, gender } = req.body;
  try {
    let user = null;

    //find a user if exist error
    if (role === "patient") {
      user = await User.findOne({ email });
    } else if (role === "doctor") {
      user = await Doctor.findOne({ email });
    }

    //check if user exist
    if (user) {
      return res.status(400).json({ message: "User already exist" });
    }

    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    if (role === "patient") {
      user = new User({
        name,
        email,
        password: hashPassword,
        photo,
        gender,
        role,
      });
    }

    if (role === "doctor") {
      user = new Doctor({
        name,
        email,
        password: hashPassword,
        photo,
        gender,
        role,
      });
    }

    await user.save();

    res
      .status(200)
      .json({ success: true, message: "User successfully created" });
  } catch (error) {
    console.error(error); 
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { email } = req.body;
  try {
    let user = null;
    //find user by email
    const patient = await User.findOne({ email });
    const doctor = await Doctor.findOne({ email });

    //asign either doctor or patient
    if (patient) {
      user = patient;
    } else if (doctor) {
      user = doctor;
    }

    //user doesnt exisst
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    //when user exist- check password match with password in database

    const isPasswordMatch = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!isPasswordMatch) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid credentials" });
    }

    //get token
    const token = generateToken(user);

    const { password, role, appointments, ...rest } = user._doc;

    res.status(200).json({
      status: true,
      message: "Successfully logged in",
      token,
      data: { ...rest },
      role,
    });
  } catch (error) {
    console.error("Login Error: ", error);
    res.status(500).json({ status: false, message: "Failed to login" });
  }
};

export const logout = async (req, res) => {
  try {
    res.status(200).json({ status: true, message: "Successfully logged out" });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ status: false, message: "Failed to logout" });
  }
};

