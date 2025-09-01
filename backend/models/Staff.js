import mongoose from "mongoose";

const StaffSchema = new mongoose.Schema(
  {
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    role: { type: String, default: "Staff" },
    shift_schedule: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Staff", StaffSchema);
