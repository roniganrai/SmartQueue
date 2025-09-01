import express from "express";
import Appointment from "../models/Appointment.js";
import User from "../models/User.js";
import { protect, allowRoles } from "../middleware/authMiddleware.js";
import { sendEmail } from "../utils/sendEmail.js";
import Staff from "../models/Staff.js";
import Notification from "../models/Notification.js";

const router = express.Router();

//Providers APIs
// Service Providers List
router.get("/providers", async (req, res) => {
  try {
    const providers = await User.find({ role: "service" }).select(
      "_id service_name service_location email mobile_number"
    );
    res.json(providers);
  } catch (err) {
    console.error("Providers Fetch Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Provider Stats (last 7 days)
router.get("/providers/:id/stats", async (req, res) => {
  try {
    const serviceId = req.params.id;
    const days = 7;
    const now = new Date();
    const result = [];

    for (let i = days - 1; i >= 0; i--) {
      const dayStart = new Date(now);
      dayStart.setHours(0, 0, 0, 0);
      dayStart.setDate(now.getDate() - i);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const count = await Appointment.countDocuments({
        service: serviceId,
        createdAt: { $gte: dayStart, $lte: dayEnd },
      });

      result.push({
        day: dayStart.toISOString().slice(5, 10),
        appointments: count,
      });
    }

    res.json(result);
  } catch (e) {
    console.error("providers/:id/stats error:", e);
    res.status(500).json({ msg: "Server error" });
  }
});

//Helpers
// Compute Queue
async function computeQueueForService(serviceId) {
  const serviceUser = await User.findById(serviceId).lean();
  const concurrency = Math.max(1, serviceUser?.staff_count || 1);
  const basePerAppt = 10; // minutes per appointment

  const booked = await Appointment.find({
    service: serviceId,
    status: { $in: ["booked", "serving"] }, // include both
  })
    .populate("user", "full_name email mobile_number")
    .sort("createdAt")
    .lean();

  const enriched = booked.map((item, idx) => {
    if (item.status === "booked") {
      const position = idx + 1;
      const estimatedMinutes = Math.ceil(
        (position * basePerAppt) / concurrency
      );
      return { ...item, position, estimated_wait_mins: estimatedMinutes };
    }
    return item;
  });

  return enriched;
}

// Compute Summary
async function computeSummaryForService(serviceId) {
  const booked = await Appointment.countDocuments({
    service: serviceId,
    status: "booked",
  });
  const served = await Appointment.countDocuments({
    service: serviceId,
    status: "served",
  });
  const cancelled = await Appointment.countDocuments({
    service: serviceId,
    status: "cancelled",
  });
  const inQueue = await Appointment.countDocuments({
    service: serviceId,
    status: "serving",
  });

  return { booked, served, cancelled, inQueue };
}

// Emit Updates (Queue + Summary)
async function emitUpdatesForService(app, serviceId) {
  try {
    const io = app.get("io");
    if (!io) return;

    const queue = await computeQueueForService(serviceId);
    io.to(`service:${serviceId}`).emit("queueUpdated", queue);

    const summary = await computeSummaryForService(serviceId);
    io.to(`service:${serviceId}`).emit("summaryUpdated", summary);
  } catch (e) {
    console.error("emitUpdatesForService error:", e.message);
  }
}

//Appointment APIs
// Update Appointment Status
router.put("/queue/:id", protect, allowRoles("service"), async (req, res) => {
  try {
    const { action } = req.body;
    const appt = await Appointment.findById(req.params.id).populate("user");

    if (!appt) return res.status(404).json({ msg: "Appointment not found" });
    if (appt.service.toString() !== req.user._id.toString())
      return res.status(403).json({ msg: "Forbidden" });

    if (["serving", "served", "no-show"].includes(action)) {
      appt.status = action;
    }
    await appt.save();

    // Send email + create notification
    let subject = "";
    let message = "";
    if (action === "serving") {
      subject = "Your Appointment is Now Being Served";
      message = `Your appointment is now being served.`;
    } else if (action === "served") {
      subject = "Your Appointment is Completed";
      message = `Your appointment has been completed successfully.`;
    } else if (action === "no-show") {
      subject = "You Missed Your Appointment";
      message = `It seems you missed your appointment. Please rebook if needed.`;
    }

    await sendEmail(
      appt.user.email,
      subject,
      `<p>Dear ${appt.user.full_name},</p><p>${message}</p>`
    );

    await Notification.create({
      user: appt.user._id,
      text: subject,
      data: { datetime: new Date(), appointmentId: appt._id },
    });

    // Live updates
    await emitUpdatesForService(req.app, req.user._id.toString());

    const io = req.app.get("io");
    if (io) {
      io.to(`user:${appt.user._id.toString()}`).emit(
        "appointmentUpdated",
        appt
      );
    }

    res.json(appt);
  } catch (err) {
    console.error("PUT /queue/:id error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Queue list (booked + serving)
router.get("/queue", protect, allowRoles("service"), async (req, res) => {
  try {
    const queue = await computeQueueForService(req.user._id);
    res.json(queue);
  } catch (err) {
    console.error("GET /api/service/queue error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get all appointments for logged-in service provider
router.get(
  "/appointments",
  protect,
  allowRoles("service"),
  async (req, res) => {
    try {
      const appts = await Appointment.find({ service: req.user._id })
        .populate("user", "full_name email mobile_number")
        .sort("-createdAt");

      res.json(appts);
    } catch (err) {
      console.error("GET /api/service/appointments error:", err);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

//Staff APIs
// ✅ CREATE staff
router.post("/staff", protect, allowRoles("service"), async (req, res) => {
  try {
    const { name, role, shift_schedule } = req.body;
    if (!name) return res.status(400).json({ msg: "Name is required" });
    const staff = await Staff.create({
      service: req.user._id,
      name,
      role,
      shift_schedule,
    });
    res.status(201).json(staff);
  } catch (err) {
    console.error("POST /api/service/staff error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// LIST staff
router.get("/staff", protect, allowRoles("service"), async (req, res) => {
  try {
    const list = await Staff.find({ service: req.user._id }).sort("-createdAt");
    res.json(list);
  } catch (err) {
    console.error("GET /api/service/staff error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// DELETE staff
router.delete(
  "/staff/:id",
  protect,
  allowRoles("service"),
  async (req, res) => {
    try {
      const s = await Staff.findById(req.params.id);
      if (!s) return res.status(404).json({ msg: "Not found" });
      if (s.service.toString() !== req.user._id.toString()) {
        return res.status(403).json({ msg: "Forbidden" });
      }
      await s.deleteOne();
      res.json({ msg: "Staff removed" });
    } catch (err) {
      console.error("DELETE /api/service/staff/:id error:", err);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

//Profile & Summary
// Service provider profile
router.get("/profile", protect, allowRoles("service"), async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "-password -__v -createdAt -updatedAt"
    );
    if (!user)
      return res.status(404).json({ msg: "Service provider not found" });

    const servedCount = await Appointment.countDocuments({
      service: req.user._id,
      status: "served",
    });

    res.json({ ...user.toObject(), servedCount });
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Dynamic service summary
router.get("/summary", protect, allowRoles("service"), async (req, res) => {
  try {
    const summary = await computeSummaryForService(req.user._id);
    res.json(summary);
  } catch (err) {
    console.error("Service Summary Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
