import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import ButtonWithSpinner from "../../components/ui/ButtonWithSpinner";
import ProviderProfileCard from "../../components/ProviderProfileCard";
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from "recharts";
import { Users, CheckCircle, XCircle } from "lucide-react";

export default function ServiceDashboardContent() {
  const [queue, setQueue] = useState([]);
  const [profile, setProfile] = useState(null);
  const [servedStats, setServedStats] = useState([]);
  const [servedCount, setServedCount] = useState(0);
  const [btnLoading, setBtnLoading] = useState({});
  const [todayStats, setTodayStats] = useState({
    waiting: 0,
    served: 0,
    noShow: 0,
  });

  const fetchAll = async () => {
    try {
      const [qres, pres, sres] = await Promise.all([
        API.get("/service/queue"),
        API.get("/auth/profile"),
        API.get(`/service/stats`),
      ]);

      const queueData = qres.data || [];
      setQueue(queueData);
      setProfile(pres.data?.user || null);

      const served = (sres.data || []).reduce(
        (acc, d) => acc + (d.appointments || 0),
        0
      );
      setServedStats(sres.data || []);
      setServedCount(served);

      // Calculate today stats
      const today = new Date().toDateString();
      const servedToday = queueData.filter(
        (q) =>
          q.status === "served" && new Date(q.datetime).toDateString() === today
      ).length;
      const noShowToday = queueData.filter(
        (q) =>
          q.status === "no-show" &&
          new Date(q.datetime).toDateString() === today
      ).length;

      setTodayStats({
        waiting: queueData.filter((q) => q.status === "waiting").length,
        served: servedToday,
        noShow: noShowToday,
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard data");
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const updateStatus = async (id, action) => {
    setBtnLoading((prev) => ({ ...prev, [`${id}-${action}`]: true }));
    try {
      await API.put(`/service/queue/${id}`, { action });
      toast.success(`Appointment marked as ${action}`);
      fetchAll();
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setBtnLoading((prev) => ({ ...prev, [`${id}-${action}`]: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white/90 backdrop-blur-lg p-6 rounded-2xl shadow flex items-center gap-3">
          <Users className="w-10 h-10 text-indigo-600" />
          <div>
            <p className="text-gray-500">Waiting in Queue</p>
            <h2 className="text-2xl font-bold text-indigo-700">
              {todayStats.waiting}
            </h2>
          </div>
        </div>
        <div className="bg-white/90 backdrop-blur-lg p-6 rounded-2xl shadow flex items-center gap-3">
          <CheckCircle className="w-10 h-10 text-green-600" />
          <div>
            <p className="text-gray-500">Served Today</p>
            <h2 className="text-2xl font-bold text-green-700">
              {todayStats.served}
            </h2>
          </div>
        </div>
        <div className="bg-white/90 backdrop-blur-lg p-6 rounded-2xl shadow flex items-center gap-3">
          <XCircle className="w-10 h-10 text-red-600" />
          <div>
            <p className="text-gray-500">No-Show Today</p>
            <h2 className="text-2xl font-bold text-red-700">
              {todayStats.noShow}
            </h2>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left side - Queue */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-white/90 backdrop-blur-lg rounded-2xl shadow-md">
            <h3 className="text-lg font-semibold text-indigo-700 mb-4 flex items-center justify-between">
              Current Queue
              <span className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
                {queue.length} waiting
              </span>
            </h3>

            {queue.length === 0 ? (
              <p className="text-gray-600 text-center py-6">
                No one is waiting right now 🚶‍♂️
              </p>
            ) : (
              <div className="space-y-3">
                {queue.map((appt, idx) => (
                  <div
                    key={appt._id}
                    className="p-4 rounded-xl border bg-gray-50 flex justify-between items-center hover:shadow transition"
                  >
                    <div>
                      <div className="font-semibold text-gray-800">
                        #{idx + 1} {appt.user?.full_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {appt.user?.email} • {appt.user?.mobile_number}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <ButtonWithSpinner
                        onClick={() => updateStatus(appt._id, "serving")}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg"
                        loading={btnLoading[`${appt._id}-serving`]}
                      >
                        Serving
                      </ButtonWithSpinner>
                      <ButtonWithSpinner
                        onClick={() => updateStatus(appt._id, "served")}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg"
                        loading={btnLoading[`${appt._id}-served`]}
                      >
                        Served
                      </ButtonWithSpinner>
                      <ButtonWithSpinner
                        onClick={() => updateStatus(appt._id, "no-show")}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg"
                        loading={btnLoading[`${appt._id}-no-show`]}
                      >
                        No-Show
                      </ButtonWithSpinner>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right side - Profile + Stats */}
        <div className="space-y-6">
          <ProviderProfileCard provider={profile} servedCount={servedCount} />

          <div className="p-6 bg-white/90 backdrop-blur-lg rounded-2xl shadow-md">
            <h3 className="text-lg font-semibold text-indigo-700 mb-3">
              Served Appointments (Last 7 days)
            </h3>
            <div className="h-48">
              {servedStats.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={servedStats}>
                    <XAxis dataKey="day" />
                    <Tooltip />
                    <Bar
                      dataKey="appointments"
                      fill="#6366F1"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-gray-500 text-center py-6">
                  No data available 📉
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
