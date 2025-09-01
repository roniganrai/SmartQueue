import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const {
      role,
      full_name,
      service_name,
      email,
      mobile_number,
      password,
      staff_count,
      service_location,
      service_start,
      service_end,
      description,
    } = req.body;

    // Check if user exists
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "Email already exists" });

    // Create user
    const user = new User({
      role,
      full_name,
      service_name,
      email,
      mobile_number,
      password,
      staff_count,
      service_location,
      service_start,
      service_end,
      description,
    });

    await user.save();

    res.status(201).json({
      msg: "User registered successfully",
      user: {
        id: user._id,
        role: user.role,
        full_name: user.full_name,
        service_name: user.service_name,
        email: user.email,
        mobile_number: user.mobile_number,
        staff_count: user.staff_count,
        service_location: user.service_location,
        service_start: user.service_start,
        service_end: user.service_end,
        description: user.description,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // Create JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        role: user.role,
        full_name: user.full_name,
        service_name: user.service_name,
        email: user.email,
        mobile_number: user.mobile_number,
        staff_count: user.staff_count,
        service_location: user.service_location,
        service_start: user.service_start,
        service_end: user.service_end,
        description: user.description,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
