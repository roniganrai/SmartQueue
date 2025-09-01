import express from "express";
import { protect, allowRoles } from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import Appointment from "../models/Appointment.js";

const router = express.Router();

//List all users
router.get("/users", protect, allowRoles("admin"), async (req, res) => {
  try {
    const users = await User.find().select("-password").sort("-createdAt");
    res.json(users);
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Server error" });
  }
});

//List all appointments
router.get("/appointments", protect, allowRoles("admin"), async (req, res) => {
  try {
    const appts = await Appointment.find()
      .populate("user", "full_name email")
      .populate("service", "service_name email")
      .sort("-createdAt");
    res.json(appts);
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Server error" });
  }
});

//Update user role
router.put(
  "/users/:id/role",
  protect,
  allowRoles("admin"),
  async (req, res) => {
    try {
      const { role } = req.body;
      if (!["normal", "service", "admin"].includes(role)) {
        return res.status(400).json({ msg: "Invalid role" });
      }
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true }
      ).select("-password");
      res.json(user);
    } catch (e) {
      console.error(e);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

//Admin summary
router.get("/summary", protect, allowRoles("admin"), async (req, res) => {
  try {
    // Users
    const totalUsers = await User.countDocuments();
    const normalUsers = await User.countDocuments({ role: "normal" });
    const serviceProviders = await User.countDocuments({ role: "service" });
    const admins = await User.countDocuments({ role: "admin" });

    // Appointments
    const totalAppointments = await Appointment.countDocuments();
    const pendingAppointments = await Appointment.countDocuments({
      status: "pending",
    });
    const servedAppointments = await Appointment.countDocuments({
      status: "served",
    });
    const cancelledAppointments = await Appointment.countDocuments({
      status: { $in: ["cancelled", "no-show"] },
    });
    const dailyAppointments = await Appointment.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      totalUsers,
      normalUsers,
      serviceProviders,
      admins,
      totalAppointments,
      pendingAppointments,
      servedAppointments,
      cancelledAppointments,
      dailyAppointments,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Server error" });
  }
});

//Admin stats
router.get("/stats", protect, allowRoles("admin"), async (req, res) => {
  try {
    const last7days = await Appointment.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // last 7 days
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(last7days);
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Server error" });
  }
});
router.delete("/users/:id", protect, allowRoles("admin"), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json({ msg: "User removed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.delete(
  "/appointments/:id",
  protect,
  allowRoles("admin"),
  async (req, res) => {
    try {
      const appt = await Appointment.findByIdAndDelete(req.params.id);
      if (!appt) {
        return res.status(404).json({ msg: "Appointment not found" });
      }
      res.json({ msg: "Appointment deleted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

export default router;
