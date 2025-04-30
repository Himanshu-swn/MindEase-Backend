// import mongoose from "mongoose";

// const bookingSchema = new mongoose.Schema(
//   {
//     doctor: {
//       type: mongoose.Types.ObjectId,
//       ref: "Doctor",
//       required: true,
//     },
//     user: {
//       type: mongoose.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     ticketPrice: { type: String, required: true },

//     status: {
//       type: String,
//       enum: ["pending", "approved", "cancelled"],
//       default: "pending",
//     },
//     isPaid: {
//       type: Boolean,
//       default: true,
//     },
//   },
//   { timestamps: true }
// );

// bookingSchema.pre(/^find/, function (next) {
//   this.populate("user").populate({
//     path: "doctor",
//     select: "name",
//   });
//   next();
// });
// export default mongoose.model("Booking", bookingSchema);


// models/Booking.js

import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  meetingId: { type: String, required: true, unique: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model("Booking", bookingSchema);
