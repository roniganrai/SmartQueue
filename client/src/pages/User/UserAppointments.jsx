import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, MapPin, Clock, XCircle } from "lucide-react";

export default function UserAppointments() {
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await API.get("/appointments");
      setAppts(res.data);
    } catch (err) {
      console.error("Fetch Error:", err);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?"))
      return;
    try {
      const res = await API.delete(`/appointments/${id}`);
      toast.success(res.data.msg || "Appointment cancelled");
      fetchAppointments();
    } catch (err) {
      console.error("Cancel Error:", err);
      toast.error(err.response?.data?.msg || "Failed to cancel appointment");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "booked":
        return "bg-indigo-100 text-indigo-700 border border-indigo-300";
      case "serving":
        return "bg-yellow-100 text-yellow-700 border border-yellow-300";
      case "served":
        return "bg-green-100 text-green-700 border border-green-300";
      case "cancelled":
        return "bg-red-100 text-red-700 border border-red-300";
      case "no-show":
        return "bg-gray-100 text-gray-600 border border-gray-300";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-indigo-700 mb-6 flex items-center gap-2">
          <CalendarDays className="w-6 h-6" /> My Appointments
        </h2>

        {loading ? (
          <p className="text-gray-500">Loading appointments...</p>
        ) : appts.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p className="mb-4">You don’t have any appointments yet.</p>
            <a
              href="/user/dashboard/book"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
            >
              ➕ Book Appointment
            </a>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <AnimatePresence>
              {appts.map((a) => (
                <motion.div
                  key={a._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="p-5 bg-white rounded-xl shadow hover:shadow-xl border border-gray-200 flex flex-col justify-between"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-lg mb-1">
                      {a.service?.service_name || "Unknown Service"}
                    </p>
                    <p className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {a.service?.service_location || "Not Available"}
                    </p>
                    <p className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <Clock className="w-4 h-4" />
                      {new Date(a.datetime).toLocaleString()}
                    </p>
                    <span
                      className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        a.status
                      )}`}
                    >
                      {a.status.toUpperCase()}
                    </span>
                  </div>

                  {a.status === "booked" && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      <button
                        onClick={() => handleCancel(a._id)}
                        className="flex items-center gap-1 px-3 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
                      >
                        <XCircle className="w-4 h-4" /> Cancel
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
