import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import ButtonWithSpinner from "../../components/ui/ButtonWithSpinner";
import { motion } from "framer-motion";
import { CalendarPlus, MapPin } from "lucide-react";

export default function UserBook() {
  const [providers, setProviders] = useState([]);
  const [form, setForm] = useState({ serviceId: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get("/service/providers")
      .then((res) => setProviders(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.serviceId) {
      toast.error("Please choose a service");
      return;
    }
    setLoading(true);
    try {
      await API.post("/appointments", { serviceId: form.serviceId });
      toast.success("Appointment booked");
      setForm({ serviceId: "" });
      window.location.href = "/user/dashboard";
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.msg || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-gradient-to-br from-white/90 to-indigo-50 backdrop-blur-lg rounded-2xl shadow-lg max-w-lg mx-auto p-8 hover:shadow-xl transition"
      >
        <h2 className="text-2xl font-bold text-indigo-700 mb-6 flex items-center gap-2">
          <CalendarPlus className="w-6 h-6" /> Book Appointment
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Service Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose Service
            </label>
            <select
              name="serviceId"
              value={form.serviceId}
              onChange={handleChange}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-white shadow-sm"
            >
              <option value="">-- Select service provider --</option>
              {providers.length === 0 ? (
                <option disabled>No services available</option>
              ) : (
                providers.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.service_name}{" "}
                    {p.service_location ? `• ${p.service_location}` : ""}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Submit Button */}
          <ButtonWithSpinner
            type="submit"
            loading={loading}
            className="w-full bg-indigo-600 text-white px-4 py-3 rounded-xl font-medium shadow hover:bg-indigo-700 transition cursor-pointer"
          >
            {loading ? "Booking..." : "Confirm Booking"}
          </ButtonWithSpinner>
        </form>
      </motion.div>
    </div>
  );
}
