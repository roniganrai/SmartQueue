import React, { useState } from "react";
import Navbar from "../Layout/Navbar";
import Footer from "../Layout/Footer";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../../api/axios";
import toast from "react-hot-toast";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Signing in...");
    try {
      const response = await API.post("/auth/login", formData);
      const payload = response.data;
      localStorage.setItem("userInfo", JSON.stringify(payload));

      toast.dismiss(toastId);
      toast.success("Login successful", {
        duration: 3000,
      });
      // after successful login
      const role = payload.user?.role;
      if (role === "service") window.location.href = "/service/dashboard";
      else if (role === "admin") window.location.href = "/admin/dashboard";
      else window.location.href = "/user/dashboard";
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message, {
        duration: 5000,
      });
      toast.dismiss(toastId);
      toast.error(error.response?.data?.msg || "Login failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-indigo-50 px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md bg-white/80 backdrop-blur-lg shadow-2xl rounded-2xl p-8 relative"
        >
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
            Welcome Back
          </h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm text-gray-600">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter registered email"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-gray-50"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && (
                <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {loading ? "Signing In..." : "Sign In"}
            </motion.button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Don’t have an account?{" "}
            <Link to="/register" className="text-indigo-600 hover:underline">
              Sign up
            </Link>
          </p>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
