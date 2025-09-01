import { useState } from "react";
import Navbar from "../Layout/Navbar";
import Footer from "../Layout/Footer";
import { motion } from "framer-motion";
import API from "../../api/axios";
import toast from "react-hot-toast";

export default function Register() {
  const [role, setRole] = useState("normal");
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setFormData({});
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const fieldsByRole = {
    normal: [
      { label: "Full Name", type: "text", name: "full_name" },
      { label: "Email", type: "email", name: "email" },
      { label: "Mobile Number", type: "text", name: "mobile_number" },
      { label: "Password", type: "password", name: "password" },
    ],
    service: [
      { label: "Service Name", type: "text", name: "service_name" },
      { label: "Email", type: "email", name: "email" },
      { label: "Mobile Number", type: "text", name: "mobile_number" },
      { label: "Password", type: "password", name: "password" },
      { label: "Number of Staff Members", type: "number", name: "staff_count" },
      { label: "Service Location", type: "text", name: "service_location" },
      { label: "Service Start Time", type: "time", name: "service_start" },
      { label: "Service End Time", type: "time", name: "service_end" },
      {
        label: "Short Description",
        type: "textarea",
        name: "description",
        placeholder: "Tell something about your service",
      },
    ],
  };

  const roleNames = {
    normal: "User",
    service: "Service Provider",
  };

  const validate = () => {
    const newErrors = {};
    if (!role) newErrors.role = "Please select a user type";
    else {
      fieldsByRole[role].forEach((field) => {
        const value =
          formData[field.name]?.trim?.() || formData[field.name] || "";
        if (!value) newErrors[field.name] = `${field.label} is required`;
        else if (
          field.type === "email" &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        )
          newErrors[field.name] = "Invalid email";
        else if (field.name === "mobile_number" && !/^\d{10}$/.test(value))
          newErrors[field.name] = "Mobile number must be 10 digits";
      });
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setLoading(true);
      const toastId = toast.loading("Processing...");
      try {
        const response = await API.post("/auth/register", {
          role,
          ...formData,
        });
        console.log("User registered:", response.data);
        toast.dismiss(toastId);
        toast.success("Account created successfully", {
          duration: 5000,
        });
        window.location.href = "/login";
      } catch (error) {
        console.error(
          "Registration error:",
          error.response?.data || error.message,
          {
            duration: 5000,
          }
        );
        toast.dismiss(toastId);
        toast.error(error.response?.data?.msg || "Registration failed!", {
          duration: 5000,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 flex items-start justify-center bg-gradient-to-br from-indigo-100 via-white to-indigo-50 px-6 pt-25">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md bg-white/80 backdrop-blur-lg shadow-2xl rounded-2xl p-6 relative"
        >
          {loading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center rounded-2xl">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
            Create Account
          </h2>

          {/* Role Selection */}
          <div className="flex justify-center space-x-10 mb-6">
            {["normal", "service"].map((r) => (
              <div
                key={r}
                className="flex flex-col items-center cursor-pointer"
                onClick={() => handleRoleSelect(r)}
              >
                <div
                  className={`w-4 h-4 rounded-full mb-1 transition-all duration-300 transform ${
                    role === r
                      ? "bg-indigo-600 scale-110"
                      : "border-2 border-gray-400 hover:scale-105"
                  }`}
                ></div>
                <span className="text-sm">{roleNames[r]}</span>
              </div>
            ))}
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {fieldsByRole[role].map((field) => {
              if (role === "service") {
                if (
                  [
                    "staff_count",
                    "service_location",
                    "service_start",
                    "service_end",
                    "description",
                  ].includes(field.name)
                ) {
                  return null;
                }
              }

              return field.type === "textarea" ? (
                <TextareaInput
                  key={field.name}
                  label={field.label}
                  name={field.name}
                  placeholder={field.placeholder}
                  value={formData[field.name] || ""}
                  onChange={handleChange}
                  error={errors[field.name]}
                />
              ) : (
                <Input
                  key={field.name}
                  label={field.label}
                  type={field.type}
                  name={field.name}
                  placeholder={`Enter your ${field.label.toLowerCase()}`}
                  value={formData[field.name] || ""}
                  onChange={handleChange}
                  error={errors[field.name]}
                />
              );
            })}

            {role === "service" && (
              <>
                <div className="flex gap-3">
                  <Input
                    label="Number of Staff Members"
                    type="number"
                    name="staff_count"
                    value={formData.staff_count || ""}
                    onChange={handleChange}
                    error={errors.staff_count}
                  />
                  <Input
                    label="Service Location"
                    type="text"
                    name="service_location"
                    value={formData.service_location || ""}
                    onChange={handleChange}
                    error={errors.service_location}
                  />
                </div>

                <div className="flex gap-3">
                  <Input
                    label="Service Start Time"
                    type="time"
                    name="service_start"
                    value={formData.service_start || ""}
                    onChange={handleChange}
                    error={errors.service_start}
                  />
                  <Input
                    label="Service End Time"
                    type="time"
                    name="service_end"
                    value={formData.service_end || ""}
                    onChange={handleChange}
                    error={errors.service_end}
                  />
                </div>

                <TextareaInput
                  label="Short Description"
                  name="description"
                  placeholder="Tell something about your service"
                  value={formData.description || ""}
                  onChange={handleChange}
                  error={errors.description}
                />
              </>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {loading ? "Processing..." : "Sign Up"}
            </motion.button>

            <p className="text-center text-sm text-gray-600 mt-4">
              Already have an account?{" "}
              <a href="/login" className="text-indigo-600 hover:underline">
                Login
              </a>
            </p>
          </form>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}

// Input Component
function Input({
  label,
  type = "text",
  name,
  placeholder,
  value,
  onChange,
  error,
}) {
  return (
    <div className="flex-1">
      <label className="block text-sm text-gray-600">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-gray-50 ${
          error ? "border-red-500" : ""
        }`}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

// Textarea Component
function TextareaInput({ label, name, placeholder, value, onChange, error }) {
  return (
    <div>
      <label className="block text-sm text-gray-600">{label}</label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows="3"
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-gray-50 ${
          error ? "border-red-500" : ""
        }`}
      ></textarea>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
