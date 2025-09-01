import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

import React, { useEffect, useRef, useState } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import ButtonWithSpinner from "../../components/ui/ButtonWithSpinner";
import ProviderDetailsModal from "../../components/ProviderDetailsModal";
import { motion } from "framer-motion";
import { CalendarDays, Bell, ClipboardList, Users } from "lucide-react";

export default function UserHome() {
  const [statusList, setStatusList] = useState([]);
  const [appts, setAppts] = useState([]);
  const [providers, setProviders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedApptId, setSelectedApptId] = useState(null);

  // loading states
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [btnLoading, setBtnLoading] = useState({});
  const [modalProviderId, setModalProviderId] = useState(null);

  const socketRef = useRef(null);
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "null");
  const userId = userInfo?.user?.id || userInfo?.user?._id;
  const baseURL =
    import.meta.env.VITE_API_URL?.replace("/api", "") ||
    "http://localhost:5000";

  const fmtDate = (d) => {
    if (!d) return "Now";
    const date = new Date(d);
    return isNaN(date.getTime()) ? "Now" : date.toLocaleString();
  };

  const topUpcoming = () => {
    if (!statusList?.length) return null;

    // sirf booked/serving appointments
    const valid = statusList.filter((a) =>
      ["booked", "serving"].includes(a.status)
    );
    if (!valid.length) return null;

    // datetime ke hisaab se sabse chhota (nearest)
    return valid.reduce((prev, curr) =>
      new Date(curr.datetime) < new Date(prev.datetime) ? curr : prev
    );
  };
  const setButtonLoading = (key, val) =>
    setBtnLoading((p) => ({ ...p, [key]: val }));

  // Optimized fetch with silent refresh
  const fetchAll = async (silent = false) => {
    if (!silent) setInitialLoading(true);
    else setRefreshing(true);

    try {
      const [sres, ares, pres, nres] = await Promise.all([
        API.get("/appointments/status"),
        API.get("/appointments"),
        API.get("/service/providers"),
        API.get("/notifications"),
      ]);
      setStatusList(sres.data || []);
      setAppts(ares.data || []);
      setProviders(pres.data || []);
      setNotifications(nres.data?.notifications || nres.data || []);
    } catch (err) {
      console.error(err);
      if (!silent) toast.error("Failed to load dashboard data");
    } finally {
      if (!silent) setInitialLoading(false);
      else setRefreshing(false);
    }
  };

  //  First load + socket updates
  useEffect(() => {
    (async () => {
      await fetchAll(false);

      const socket = io(baseURL, { withCredentials: true });
      socketRef.current = socket;
      if (userId) socket.emit("joinUserRoom", userId);

      socket.on("appointmentCreated", () => fetchAll(true));
      socket.on("appointmentUpdated", () => fetchAll(true));
      socket.on("queueUpdated", () => fetchAll(true));

      //  New Notification Event
      socket.on("newNotification", (notif) => {
        setNotifications((prev) => [notif, ...prev].slice(0, 10));
        toast.success(notif.text || "🔔 New notification");
      });

      return () => socket.disconnect();
    })();
  }, [userId]);

  // Interval refresh (silent)
  useEffect(() => {
    const interval = setInterval(() => fetchAll(true), 15000);
    return () => clearInterval(interval);
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;
    setButtonLoading(`cancel-${id}`, true);
    try {
      await API.delete(`/appointments/${id}`);
      toast.success("Cancelled");
      fetchAll(true);
    } catch (err) {
      console.error(err);
      toast.error("Cancel failed");
    } finally {
      setButtonLoading(`cancel-${id}`, false);
    }
  };

  const startReschedule = async (appt) => {
    const current = new Date(appt.datetime);
    const date = prompt(
      "New date (YYYY-MM-DD)",
      current.toISOString().slice(0, 10)
    );
    if (!date) return;
    const time = prompt("New time (HH:mm)", current.toTimeString().slice(0, 5));
    if (!time) return;
    setButtonLoading(`resched-${appt._id}`, true);
    try {
      await API.put(`/appointments/${appt._id}`, {
        datetime: `${date}T${time}`,
      });
      toast.success("Rescheduled");
      fetchAll(true);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.msg || "Reschedule failed");
    } finally {
      setButtonLoading(`resched-${appt._id}`, false);
    }
  };

  const bookAgain = (serviceId) => {
    window.location.href = `/user/dashboard/book?service=${serviceId}`;
  };

  const nearestUpcoming = topUpcoming();

  const upcoming =
    statusList.find((s) => s._id === selectedApptId) || topUpcoming();

  //  Toast Alerts for Queue Events
  useEffect(() => {
    if (upcoming?.position === 1) {
      toast.success("🚶 You are next! Please proceed to the counter.");
    }
    if (upcoming?.status === "serving") {
      toast("🟢 Your service has started.", { icon: "⚡" });
    }
  }, [upcoming?.position, upcoming?.status]);

  //  First load skeleton
  if (initialLoading)
    return (
      <div className="p-6">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 text-center">
          Loading dashboard...
        </div>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Refresh indicator */}
      {refreshing && (
        <div className="text-xs text-gray-500">🔄 Updating data...</div>
      )}

      {/* ===== Summary Cards ===== */}
      <div className="grid gap-6 md:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 bg-white rounded-xl shadow hover:shadow-md transition flex items-center gap-4"
        >
          <ClipboardList className="w-10 h-10 text-indigo-600" />
          <div>
            <p className="text-sm text-gray-600">Appointments</p>
            <p className="text-xl font-bold">{appts.length}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 bg-white rounded-xl shadow hover:shadow-md transition flex items-center gap-4"
        >
          <CalendarDays className="w-10 h-10 text-green-600" />
          <div>
            <p className="text-sm text-gray-600">Upcoming</p>
            <p className="text-xl font-bold">
              {nearestUpcoming ? fmtDate(nearestUpcoming.datetime) : "—"}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-5 bg-white rounded-xl shadow hover:shadow-md transition flex items-center gap-4"
        >
          <Users className="w-10 h-10 text-yellow-600" />
          <div>
            <p className="text-sm text-gray-600">Queue Position</p>
            <p className="text-xl font-bold">{upcoming?.position ?? "—"}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-5 bg-white rounded-xl shadow hover:shadow-md transition flex items-center gap-4"
        >
          <Bell className="w-10 h-10 text-red-600" />
          <div>
            <p className="text-sm text-gray-600">Notifications</p>
            <p className="text-xl font-bold">{notifications.length}</p>
          </div>
        </motion.div>
      </div>

      {/* ===== Main Dashboard Grid ===== */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column */}
        <div className="md:col-span-2 space-y-6">
          {/* Queue Status */}
          <div className="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition">
            <h3 className="text-lg font-semibold text-indigo-700 mb-4">
              Real-time Queue Status
            </h3>

            {!upcoming ? (
              <p className="text-gray-600">
                You have no upcoming appointments.
              </p>
            ) : upcoming.status === "serving" ? (
              // 🟢 Case 1: Serving ongoing
              <div className="flex flex-col items-center text-center py-10">
                <p className="text-2xl font-bold text-green-600">
                  🟢 Serving in progress
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  You are currently being served at{" "}
                  <span className="font-semibold">
                    {upcoming.service?.service_name}
                  </span>
                </p>
              </div>
            ) : upcoming.position === 1 ? (
              // 🟡 Case 2: User is next
              <div className="flex flex-col items-center text-center py-10">
                <p className="text-2xl font-bold text-indigo-600">
                  🚶 You are Next!
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Please proceed to{" "}
                  <span className="font-semibold">
                    {upcoming.service?.service_name}
                  </span>
                </p>
                <p className="text-sm text-gray-500">
                  Location: {upcoming.service?.service_location}
                </p>
              </div>
            ) : (
              // 🔵 Case 3: Normal waiting
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Service</p>
                  <p className="text-xl font-bold text-gray-900">
                    {upcoming.service?.service_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {upcoming.service?.service_location}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Booked At: {fmtDate(upcoming.datetime)}
                  </p>
                </div>

                {/* Circular wait indicator */}
                <div className="flex-1 flex flex-col items-center justify-center">
                  <p className="text-sm text-gray-600">Your Position</p>
                  <p className="text-5xl font-extrabold text-indigo-600 my-2">
                    {upcoming.position ?? "-"}
                  </p>

                  {upcoming.estimated_wait_mins != null && (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-24 h-24">
                        <CircularProgressbar
                          value={Math.max(
                            0,
                            100 - Math.min(upcoming.estimated_wait_mins, 100)
                          )}
                          text={`${upcoming.estimated_wait_mins}m`}
                          styles={buildStyles({
                            textSize: "16px",
                            textColor: "#4f46e5",
                            pathColor:
                              upcoming.estimated_wait_mins <= 5
                                ? "#16a34a"
                                : upcoming.estimated_wait_mins <= 15
                                ? "#facc15"
                                : "#ef4444",
                            trailColor: "#e5e7eb",
                          })}
                        />
                      </div>
                      <p className="text-sm text-gray-600">
                        Estimated wait:{" "}
                        <span className="font-semibold">
                          {upcoming.estimated_wait_mins} minutes
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Appointments */}
          <div className="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-indigo-700">
                Your Current Appointments
              </h3>
            </div>
            {appts.length === 0 ? (
              <p className="text-gray-600">No appointments yet. Book now.</p>
            ) : (
              <div className="space-y-3">
                {appts
                  .filter((a) => ["booked", "serving"].includes(a.status))
                  .map((a) => (
                    <div
                      key={a._id}
                      onClick={() => setSelectedApptId(a._id)}
                      className={`p-3 border rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-3 hover:shadow-sm transition
                      ${
                        selectedApptId === a._id
                          ? "border-indigo-500 bg-indigo-50"
                          : ""
                      }`}
                    >
                      <div>
                        <p className="font-semibold">
                          {a.service?.service_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {a.service?.service_location}
                        </p>
                        <p className="text-sm text-gray-600">
                          Booked At: {fmtDate(a.datetime)}
                        </p>
                        <span className="mt-1 inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                          {a.status.toUpperCase()}
                        </span>
                      </div>
                      {a.status === "booked" && (
                        <div className="flex gap-2">
                          <ButtonWithSpinner
                            onClick={() => handleCancel(a._id)}
                            className="bg-red-500 text-white cursor-pointer"
                            loading={btnLoading[`cancel-${a._id}`]}
                          >
                            Cancel
                          </ButtonWithSpinner>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Notifications */}
          <div className="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-indigo-700">
                Notifications
              </h3>
              {notifications.length > 0 && (
                <button
                  onClick={async () => {
                    if (!window.confirm("Clear all notifications?")) return;
                    try {
                      await API.delete("/notifications/clear/all");
                      setNotifications([]);
                      toast.success("All notifications cleared");
                    } catch (err) {
                      console.error(err);
                      toast.error("Failed to clear notifications");
                    }
                  }}
                  className="text-xs px-3 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 transition"
                >
                  Clear All
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <p className="text-gray-600">No recent notifications.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-auto">
                {notifications.map((n) => (
                  <div
                    key={n._id || n.id}
                    className="p-2 border rounded bg-white hover:bg-indigo-50 transition"
                  >
                    {/* Text / Message */}
                    <p className="text-sm font-medium">
                      {n.text || "Notification"}
                    </p>

                    {/* Date & Time */}
                    <p className="text-xs text-gray-500">
                      {n.data?.datetime
                        ? `At ${fmtDate(n.data.datetime)}`
                        : n.createdAt
                        ? fmtDate(n.createdAt)
                        : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition">
            <h3 className="text-lg font-semibold text-indigo-700 mb-3">
              Available Services
            </h3>
            {providers.length === 0 ? (
              <p className="text-gray-600">No providers found.</p>
            ) : (
              <div className="space-y-2">
                {providers.map((p) => (
                  <div
                    key={p._id}
                    className="p-2 border rounded flex justify-between items-center hover:shadow-sm transition"
                  >
                    <div>
                      <p className="font-medium">{p.service_name}</p>
                      <p className="text-sm text-gray-500">
                        {p.service_location}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <ButtonWithSpinner
                        onClick={() => setModalProviderId(p._id)}
                        className="bg-white border border-indigo-600 text-indigo-600"
                        loading={btnLoading[`view-${p._id}`]}
                      >
                        Details
                      </ButtonWithSpinner>
                      <ButtonWithSpinner
                        onClick={() => bookAgain(p._id)}
                        className="bg-indigo-600 text-white"
                        loading={btnLoading[`book-${p._id}`]}
                      >
                        Book
                      </ButtonWithSpinner>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Provider Modal */}
      {modalProviderId && (
        <ProviderDetailsModal
          providerId={modalProviderId}
          onClose={() => setModalProviderId(null)}
        />
      )}
    </div>
  );
}
