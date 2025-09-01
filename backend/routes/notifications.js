import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import Notification from "../models/Notification.js";

const router = express.Router();

//Get user notifications (latest first, paginated) * @query ?limit=10&skip=0

router.get("/", protect, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const skip = parseInt(req.query.skip) || 0;

    const notifs = await Notification.find({ user: req.user._id })
      .sort("-createdAt")
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments({ user: req.user._id });

    res.json({
      total,
      count: notifs.length,
      notifications: notifs,
    });
  } catch (e) {
    console.error("GET /api/notifications error:", e);
    res.status(500).json({ msg: "Server error" });
  }
});

//Mark all notifications as read
router.put("/mark-read", protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { $set: { read: true } }
    );
    res.json({ msg: "All notifications marked as read" });
  } catch (e) {
    console.error("PUT /api/notifications/mark-read error:", e);
    res.status(500).json({ msg: "Server error" });
  }
});

//Mark single notification as read
router.put("/:id/read", protect, async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: { read: true } },
      { new: true }
    );
    if (!notif) return res.status(404).json({ msg: "Notification not found" });
    res.json(notif);
  } catch (e) {
    console.error("PUT /api/notifications/:id/read error:", e);
    res.status(500).json({ msg: "Server error" });
  }
});

//Delete single notification
router.delete("/:id", protect, async (req, res) => {
  try {
    const notif = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!notif) return res.status(404).json({ msg: "Notification not found" });
    res.json({ msg: "Notification deleted" });
  } catch (e) {
    console.error("DELETE /api/notifications/:id error:", e);
    res.status(500).json({ msg: "Server error" });
  }
});

//Clear all notifications for user
router.delete("/clear/all", protect, async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user._id });
    res.json({ msg: "All notifications cleared" });
  } catch (e) {
    console.error("DELETE /api/notifications/clear/all error:", e);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
