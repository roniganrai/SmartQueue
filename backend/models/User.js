import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["normal", "service", "admin"],
      default: "normal",
    },

    // Common fields for all roles
    full_name: { type: String },
    email: { type: String, required: true, unique: true },
    mobile_number: { type: String, required: true },
    password: { type: String, required: true },

    // Service provider specific fields (optional)
    service_name: { type: String },
    staff_count: { type: Number },
    service_location: { type: String },
    service_start: { type: String }, // HH:mm format
    service_end: { type: String }, // HH:mm format
    description: { type: String },
  },
  { timestamps: true }
);

// Password hashing before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Password comparison method for login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
