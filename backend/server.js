import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.js";
import appointmentRoutes from "./routes/appointments.js";
import serviceRoutes from "./routes/service.js";
import adminRoutes from "./routes/admin.js";
import notificationRoutes from "./routes/notifications.js";

dotenv.config();
const app = express();

// CORS (API)
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/service", serviceRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);

// HTTP + Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
});

// Make io available in routes via req.app.get('io')
app.set("io", io);

// Socket connections
// inside server.js where you already have io.on("connection", ...)
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // Service dashboard will join its own room
  socket.on("joinServiceRoom", (serviceId) => {
    const room = `service:${serviceId}`;
    socket.join(room);
    // optional ack
    socket.emit("joinedServiceRoom", room);
  });

  // Allow users (clients) to join their user-specific room to receive direct appointment notifications
  socket.on("joinUserRoom", (userId) => {
    const room = `user:${userId}`;
    socket.join(room);
    socket.emit("joinedUserRoom", room);
  });

  socket.on("disconnect", () => {
    // console.log("Socket disconnected:", socket.id);
  });
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
