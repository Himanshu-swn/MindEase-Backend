// Import Modules
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import http from "http";
import { ExpressPeerServer } from "peer";
import { Server as socketIo } from "socket.io";
import { v4 as uuidv4 } from "uuid";

// Import Routes
import authRoute from "./Routes/auth.js";
import userRoute from "./Routes/user.js";
import doctorRoute from "./Routes/doctor.js";
import reviewRoute from "./Routes/review.js";
import bookingRoute from "./Routes/booking.js";
import Booking from "./models/Booking.js"; // Import Booking model
// import meetingRoute from "./Routes/meeting.js"; // (optional if you modularize meetings)

dotenv.config();

// Initialize app
const app = express();
const port = process.env.PORT || 5000;

// Create HTTP Server
const server = http.createServer(app);

// Middleware
const corsOptions = {
  origin: true,
};

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

// Routes
app.use("/auth", authRoute);
app.use("/users", userRoute);
app.use("/doctors", doctorRoute);
app.use("/reviews", reviewRoute);
app.use("/bookings", bookingRoute);
// app.use("/meetings", meetingRoute);  // If you modularize meetings

app.get("/", (req, res) => {
  res.send("API is working");
});

// MongoDB
mongoose.set("strictQuery", false);
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB is connected");
  } catch (error) {
    console.log(error.message);
  }
};

// PeerJS Server
const peerServer = ExpressPeerServer(server, {
  debug: true,
  path: "/",
});
app.use("/peerjs", peerServer);

// In-memory Meetings
const meetings = new Map();

// Meeting Creation Route
app.post("/meetings", async (req, res) => {
  const { doctorId, userId, date, time } = req.body;

  if (!doctorId || !userId || !date || !time) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const meetingId = uuidv4();
  meetings.set(meetingId, {
    id: meetingId,
    participants: [],
    createdAt: new Date(),
  });

  try {
    // Store in DB
    const booking = new Booking({
      meetingId,
      doctor: doctorId,
      user: userId,
      date,
      time,
    });

    await booking.save();

    return res.status(201).json({ meetingId, message: "Booking created" });
  } catch (error) {
    console.error("Error saving booking:", error);
    return res.status(500).json({ message: "Failed to create booking" });
  }

  return res.status(201).json({ meetingId });
});

// Meeting Existence Check Route
app.get("/meetings/:meetingId", (req, res) => {
  const { meetingId } = req.params;

  if (meetings.has(meetingId)) {
    return res.status(200).json({ exists: true });
  } else {
    return res.status(404).json({ exists: false });
  }
});

// Socket.IO Setup
const io = new socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-meeting", (meetingId, userId) => {
    console.log(`User ${userId} joining meeting ${meetingId}`);

    socket.join(meetingId);
    socket.to(meetingId).emit("user-connected", userId);

    // Update meeting participants
    if (meetings.has(meetingId)) {
      const meeting = meetings.get(meetingId);
      if (!meeting.participants.includes(userId)) {
        meeting.participants.push(userId);  // ✅ Only add if not already there
      }
    }

    socket.on("disconnect", () => {
      console.log(`User ${userId} disconnected`);
      socket.to(meetingId).emit("user-disconnected", userId);

      if (meetings.has(meetingId)) {
        const meeting = meetings.get(meetingId);
        meeting.participants = meeting.participants.filter((id) => id !== userId);

        // Clean up empty meetings
        if (meeting.participants.length === 0) {
          setTimeout(() => {
            if (meetings.has(meetingId) && meetings.get(meetingId).participants.length === 0) {
              meetings.delete(meetingId);
              console.log(`Meeting ${meetingId} removed due to inactivity`);
            }
          }, 5 * 60 * 1000); // 5 minutes
        }
      }
    });
  });
});

// Start Server
server.listen(port, () => {
  connectDB();
  console.log(`Server is running at http://localhost:${port}`);
});
