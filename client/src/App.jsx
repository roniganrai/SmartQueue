import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import React from "react";

// Components
import Landing from "./components/Landing";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import ProtectedRoute from "./components/ProtectedRoute";

// User Pages
import UserDashboardLayout from "./pages/User/UserDashboardLayout";
import UserHome from "./pages/User/UserHome";
import UserAppointments from "./pages/User/UserAppointments";
import UserBook from "./pages/User/UserBook";
import UserProfile from "./pages/User/UserProfile";

// Service Pages
import ServiceDashboardLayout from "./pages/Service/ServiceDashboardLayout";
import ServiceDashboard from "./pages/Service/ServiceDashboard";
import ServiceQueue from "./pages/Service/ServiceQueue";
import ServiceAppointments from "./pages/Service/ServiceAppointments";
import ServiceStaff from "./pages/Service/ServiceStaff";
import ServiceProfile from "./pages/Service/ServiceProfile";
// Admin Pages
import AdminDashboardLayout from "./pages/Admin/AdminDashboardLayout";
import AdminUsers from "./pages/Admin/AdminUsers";
import AdminAppointments from "./pages/Admin/AdminAppointments";
import AdminOverview from "./pages/Admin/AdminOverview";

function App() {
  return (
    <>
      <Toaster position="bottom-right" reverseOrder={false} />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={["normal"]} />}>
          <Route path="/user/dashboard" element={<UserDashboardLayout />}>
            <Route index element={<UserHome />} />
            <Route path="appointments" element={<UserAppointments />} />
            <Route path="book" element={<UserBook />} />
            <Route path="profile" element={<UserProfile />} />
          </Route>
        </Route>

        {/* Service Provider Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={["service"]} />}>
          <Route path="/service/dashboard" element={<ServiceDashboardLayout />}>
            <Route index element={<ServiceDashboard />} />
            <Route path="queue" element={<ServiceQueue />} />
            <Route path="appointments" element={<ServiceAppointments />} />
            <Route path="staff" element={<ServiceStaff />} />
            <Route path="profile" element={<ServiceProfile />} />
          </Route>
        </Route>

        {/* Admin Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboardLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="appointments" element={<AdminAppointments />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
