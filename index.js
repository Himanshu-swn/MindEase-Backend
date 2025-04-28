import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoute from "./Routes/auth.js";
import userRoute from "./Routes/user.js";
import doctorRoute from "./Routes/doctor.js";
import reviewRoute from "./Routes/review.js";
import bookingRoute from "./Routes/booking.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

const corsOptions = {
  origin: true,
};

app.get("/", (req, res) => {
  res.send(`Api is working`);
});

//MONGO
mongoose.set("strictQuery", false);
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB is connected`);
  } catch (error) {
    console.log(error.messages);
  }
};
//middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

app.use("/auth", authRoute); //register, login
app.use("/users", userRoute); //crud user
app.use("/doctors", doctorRoute); //crud doctor
app.use("/reviews", reviewRoute); //crud review
app.use("/bookings", bookingRoute); //crud review

app.listen(port, () => {
  connectDB();
  console.log(`Server is running http://localhost:${port} `);
});
