import express from "express";
import Appointment from "../models/Appointment.js";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";
import Notification from "../models/Notification.js";

const router = express.Router();

/** ---------- helpers ---------- */

// queue compute (booked only)
async function computeQueueForService(serviceId) {
  const serviceUser = await User.findById(serviceId).lean();
  const concurrency = Math.max(1, serviceUser?.staff_count || 1);
  const basePerAppt = 10; // mins per appt

  const booked = await Appointment.find({
    service: serviceId,
    status: "booked",
  })
    .populate("user", "full_name")
    .sort("createdAt")
    .lean();

  return booked.map((item, idx) => {
    const position = idx + 1;
    const estimatedMinutes = Math.ceil((position * basePerAppt) / concurrency);
    return {
      ...item,
      position,
      estimated_wait_mins: estimatedMinutes,
    };
  });
}

async function emitQueueForService(app, serviceId) {
  try {
    const io = app.get("io");
    if (!io) return;
    const queue = await computeQueueForService(serviceId);
    io.to(`service:${serviceId}`).emit("queueUpdated", queue);

    const serviceUser = await User.findById(serviceId).lean();
    const serviceName =
      serviceUser?.service_name || serviceUser?.full_name || "Service";

    if (queue.length > 0) {
      const nextUser = queue.find((q) => q.position === 1);
      if (nextUser) {
        try {
          const user = await User.findById(nextUser.user);

          //  Notification bhi create karenge
          await Notification.create({
            user: user._id,
            text: `🚶 You are next at ${serviceName}. Please proceed to the shop.`,
            data: { appointmentId: nextUser._id },
          });

          // Email bhejna jab user 1st ho
          if (user?.email) {
            await sendEmail(
              user.email,
              "🚶 You are Next in Queue",
              `<h2>Hello ${user.full_name || "User"},</h2>
               <p>You are next in line for <b>${serviceName}</b>.</p>
               <p>Please proceed to the shop/counter now.</p>
               <p>Thank you,<br/>SmartQueue</p>`
            );
          }
        } catch (e) {
          console.warn("Failed to send 'next in queue' email:", e.message);
        }
      }
    }
  } catch (e) {
    console.error("emitQueueForService error:", e.message);
  }
}

// small helper to create + count unread
async function notify(userId, message) {
  try {
    await Notification.create({ user: userId, text: message });
  } catch (e) {
    console.error("Notification create failed:", e.message);
  }
}

/** ---------- routes ---------- */

//CREATE APPOINTMENT
router.post("/", protect, async (req, res) => {
  try {
    const { serviceId } = req.body;
    if (!serviceId) {
      return res.status(400).json({ msg: "Missing serviceId" });
    }

    const serviceUser = await User.findById(serviceId);
    if (!serviceUser || serviceUser.role !== "service") {
      return res.status(400).json({ msg: "Invalid service provider" });
    }

    // 👇 yaha backend khud current datetime le lega
    const currentDateTime = new Date();

    const appt = new Appointment({
      user: req.user._id,
      service: serviceId,
      datetime: currentDateTime,
      status: "booked",
    });

    await appt.save();

    // email service provider
    try {
      await sendEmail(
        serviceUser.email,
        "New Appointment Booked",
        `<h2>Hello ${serviceUser.service_name || serviceUser.full_name},</h2>
         <p>A new appointment has been booked by <b>${
           req.user.full_name
         }</b>.</p>
         <p><b>Date & Time:</b> ${currentDateTime.toLocaleString()}</p>
         <p>Please login to your dashboard for more details.</p>`
      );
    } catch (e) {
      console.warn("email send failed:", e.message);
    }

    // user notification
    await notify(
      req.user._id,
      `Appointment booked with ${
        serviceUser.service_name || "Service"
      } for ${currentDateTime.toLocaleString()}.`
    );

    // live updates
    await emitQueueForService(req.app, serviceId);
    const io = req.app.get("io");
    if (io) {
      io.to(`user:${req.user._id.toString()}`).emit("appointmentCreated", appt);
    }

    res.status(201).json(appt);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

//GET ALL APPOINTMENTS FOR LOGGED-IN USER
router.get("/", protect, async (req, res) => {
  try {
    const appts = await Appointment.find({ user: req.user._id }).populate(
      "service",
      "service_name service_location email"
    );
    res.json(appts);
  } catch (err) {
    console.error("GET /api/appointments error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

//GET QUEUE STATUS for logged-in user (booked/serving & upcoming)
router.get("/status", protect, async (req, res) => {
  try {
    const appts = await Appointment.find({
      user: req.user._id,
      status: { $in: ["booked", "serving"] },
    })
      .populate("service", "service_name service_location staff_count")
      .sort("createdAt")
      .lean();

    const result = [];
    for (const a of appts) {
      const serviceId = a.service?._id;
      if (!serviceId) {
        result.push({ ...a, position: null, estimated_wait_mins: null });
        continue;
      }
      const queue = await computeQueueForService(serviceId);
      const found = queue.find((q) => q._id.toString() === a._id.toString());
      result.push(
        found
          ? {
              ...a,
              position: found.position,
              estimated_wait_mins: found.estimated_wait_mins,
            }
          : { ...a, position: null, estimated_wait_mins: null }
      );
    }

    res.json(result);
  } catch (err) {
    console.error("GET /api/appointments/status error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

//CANCEL APPOINTMENT
router.delete("/:id", protect, async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id).populate(
      "service",
      "service_name"
    );
    if (!appt) return res.status(404).json({ msg: "Appointment not found" });

    if (appt.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: "Forbidden" });
    }

    appt.status = "cancelled";
    await appt.save();

    // notify user
    await notify(
      req.user._id,
      `Appointment with ${
        appt.service?.service_name || "Service"
      } has been cancelled.`
    );

    // live updates
    await emitQueueForService(req.app, appt.service.toString());
    const io = req.app.get("io");
    if (io)
      io.to(`user:${req.user._id.toString()}`).emit("appointmentUpdated", appt);

    res.json({ msg: "Appointment cancelled successfully" });
  } catch (err) {
    console.error("DELETE /api/appointments/:id error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
