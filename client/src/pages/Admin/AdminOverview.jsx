import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

export default function AdminOverview() {
  const [summary, setSummary] = useState(null);
  const [dailyStats, setDailyStats] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/summary");
      setSummary(res.data);
      setDailyStats(res.data.dailyAppointments || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">📊 Admin Overview</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {/* Users Breakdown */}
          <h3 className="text-lg font-semibold mb-2">👥 Users</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 bg-indigo-100 rounded shadow text-center">
              <p className="text-gray-700 text-sm">Total Users</p>
              <h3 className="text-2xl font-bold text-indigo-700">
                {summary?.totalUsers || 0}
              </h3>
            </div>
            <div className="p-4 bg-blue-100 rounded shadow text-center">
              <p className="text-gray-700 text-sm">Normal Users</p>
              <h3 className="text-2xl font-bold text-blue-700">
                {summary?.normalUsers || 0}
              </h3>
            </div>
            <div className="p-4 bg-green-100 rounded shadow text-center">
              <p className="text-gray-700 text-sm">Service Providers</p>
              <h3 className="text-2xl font-bold text-green-700">
                {summary?.serviceProviders || 0}
              </h3>
            </div>
            <div className="p-4 bg-purple-100 rounded shadow text-center">
              <p className="text-gray-700 text-sm">Admins</p>
              <h3 className="text-2xl font-bold text-purple-700">
                {summary?.admins || 0}
              </h3>
            </div>
          </div>

          {/* Appointments Breakdown */}
          <h3 className="text-lg font-semibold mb-2">📅 Appointments</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 bg-yellow-100 rounded shadow text-center">
              <p className="text-gray-700 text-sm">Total Appointments</p>
              <h3 className="text-2xl font-bold text-yellow-700">
                {summary?.totalAppointments || 0}
              </h3>
            </div>
            <div className="p-4 bg-sky-100 rounded shadow text-center">
              <p className="text-gray-700 text-sm">Pending</p>
              <h3 className="text-2xl font-bold text-sky-700">
                {summary?.pendingAppointments || 0}
              </h3>
            </div>
            <div className="p-4 bg-green-100 rounded shadow text-center">
              <p className="text-gray-700 text-sm">Served</p>
              <h3 className="text-2xl font-bold text-green-700">
                {summary?.servedAppointments || 0}
              </h3>
            </div>
            <div className="p-4 bg-red-100 rounded shadow text-center">
              <p className="text-gray-700 text-sm">Cancelled / No-Show</p>
              <h3 className="text-2xl font-bold text-red-700">
                {summary?.cancelledAppointments || 0}
              </h3>
            </div>
          </div>

          {/* Daily Appointment Trend */}
          <div className="bg-white p-6 rounded shadow mb-8">
            <h3 className="text-lg font-semibold mb-4">
              📈 Appointments Trend (Last 7 Days)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#6366F1"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Role Distribution */}
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-lg font-semibold mb-4">
              📊 User Roles Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { name: "Normal Users", value: summary?.normalUsers || 0 },
                  {
                    name: "Service Providers",
                    value: summary?.serviceProviders || 0,
                  },
                  { name: "Admins", value: summary?.admins || 0 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
