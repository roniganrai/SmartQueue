import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // service provider user id
    datetime: { type: Date, required: true },
    status: {
      type: String,
      enum: ["booked", "serving", "served", "cancelled", "no-show"],
      default: "booked",
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Appointment", AppointmentSchema);
