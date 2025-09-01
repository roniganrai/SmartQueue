import React, { useEffect, useMemo, useState, useCallback } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { CalendarDays, CheckCircle2, Users, ListChecks } from "lucide-react";
import StatCard from "../../components/service/StatCard";
import ProviderProfileCard from "../../components/service/ProviderProfileCard";
import ButtonWithSpinner from "../../components/service/ButtonWithSpinner";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import socket from "../../utils/socket";

const COLORS = ["#6366F1", "#22C55E", "#EF4444"];

export default function ServiceDashboard() {
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [summary, setSummary] = useState({
    booked: 0,
    served: 0,
    cancelled: 0,
    inQueue: 0,
  });
  const [profile, setProfile] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  // fetch summary, profile, queue, weekly
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      // main endpoints (summary + queue + profile)
      const [qRes, profRes, sumRes] = await Promise.all([
        API.get("/service/queue"),
        API.get("/service/profile").catch(async () => {
          // fallback to auth/profile if endpoint unavailable
          const a = await API.get("/auth/profile");
          return { data: a.data?.user || {} };
        }),
        API.get("/service/summary"),
      ]);

      setQueue(qRes.data || []);
      setProfile(profRes.data || {});
      setSummary(
        sumRes.data || { booked: 0, served: 0, cancelled: 0, inQueue: 0 }
      );

      // weekly stats — use provider id if available
      if (profRes.data?._id) {
        try {
          const wRes = await API.get(
            `/service/providers/${profRes.data._id}/stats`
          );
          setWeekly(wRes.data || []);
        } catch (e) {
          setWeekly([]);
        }
      } else {
        setWeekly([]);
      }
    } catch (err) {
      console.error("fetchAll error:", err);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // join socket room when profile available
  useEffect(() => {
    if (!profile?._id) return;

    // join service room
    socket.emit("joinServiceRoom", profile._id);

    // queue updates
    const onQueue = (data) => {
      if (!data) return;
      setQueue(data);
    };

    // summary updates
    const onSummary = (data) => {
      if (!data) return;
      setSummary((prev) => ({ ...prev, ...data }));
    };

    // appointment updated (specific user notified) -> show toast + refresh summary if needed
    const onAppointmentUpdated = (appt) => {
      // small toast for visibility
      if (appt?.user?.full_name && appt?.status) {
        toast.success(
          `${appt.user.full_name} — ${String(appt.status).toUpperCase()}`
        );
      }
    };

    socket.on("queueUpdated", onQueue);
    socket.on("summaryUpdated", onSummary);
    socket.on("appointmentUpdated", onAppointmentUpdated);

    return () => {
      socket.off("queueUpdated", onQueue);
      socket.off("summaryUpdated", onSummary);
      socket.off("appointmentUpdated", onAppointmentUpdated);
    };
  }, [profile?._id]);

  const updateStatus = async (id, action) => {
    setActionLoading((p) => ({ ...p, [id + "-" + action]: true }));
    try {
      await API.put(`/service/queue/${id}`, { action });

      // After successful update: backend emits queueUpdated + summaryUpdated.
      // So we rely on socket to update UI; but keep a fallback to fetchAll after small delay
      // to handle missed socket events (network flakiness).
      setTimeout(() => {
        // only fetch fallback if socket didn't update queue within 1.2s
        // (this avoids unnecessary refresh when socket already pushed updates)
        fetchAll();
      }, 1200);
    } catch (err) {
      console.error("updateStatus error:", err);
      toast.error(err?.response?.data?.msg || "Update failed");
    } finally {
      setActionLoading((p) => ({ ...p, [id + "-" + action]: false }));
    }
  };

  const queuePreview = queue.slice(0, 6);

  const ratioData = useMemo(
    () => [
      { name: "Booked", value: summary.booked || 0 },
      { name: "Served", value: summary.served || 0 },
      { name: "Cancelled", value: summary.cancelled || 0 },
    ],
    [summary]
  );

  const weeklyData = Array.isArray(weekly) ? weekly : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-sm text-gray-500">
          Live queue, weekly trends and quick actions
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Booked" value={summary.booked} icon={CalendarDays} />
        <StatCard
          title="Served"
          value={summary.served}
          accent="green"
          icon={CheckCircle2}
        />
        <StatCard
          title="Cancelled"
          value={summary.cancelled}
          accent="red"
          icon={Users}
        />
        <StatCard
          title="In Queue"
          value={summary.inQueue}
          accent="amber"
          icon={ListChecks}
        />
      </div>

      {/* Weekly chart + Ratio */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 p-4 bg-white rounded-2xl shadow-sm ring-1 ring-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Weekly Served</h3>
            <div className="text-xs text-gray-400">Last 7 days</div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" />
                <Tooltip />
                <Area
                  dataKey="appointments"
                  stroke="#6366F1"
                  fill="url(#g1)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl shadow-sm ring-1 ring-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Status Ratio</h3>
            <div className="text-xs text-gray-400">Overview</div>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ratioData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {ratioData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 grid grid-cols-3 text-xs text-gray-600 gap-2">
            {ratioData.map((r, i) => (
              <div key={r.name} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded"
                  style={{ background: COLORS[i % COLORS.length] }}
                />
                <span>
                  {r.name} — <b>{r.value ?? 0}</b>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Queue + Profile */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <div className="p-4 bg-white rounded-2xl shadow-sm ring-1 ring-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Live Queue</h3>
              <div className="text-xs text-gray-400">Total: {queue.length}</div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-gray-500">
                Loading queue…
              </div>
            ) : queuePreview.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                No customers in the queue right now
              </div>
            ) : (
              <div className="space-y-3">
                {queuePreview.map((a, i) => (
                  <div
                    key={a._id}
                    className="p-3 rounded-xl border bg-gray-50 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium">
                        #{i + 1} {a.user?.full_name || "Customer"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(a.datetime).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <ButtonWithSpinner
                        loading={!!actionLoading[a._id + "-serving"]}
                        onClick={() => updateStatus(a._id, "serving")}
                        className="bg-indigo-600 text-white"
                      >
                        Serving
                      </ButtonWithSpinner>
                      <ButtonWithSpinner
                        loading={!!actionLoading[a._id + "-served"]}
                        onClick={() => updateStatus(a._id, "served")}
                        className="bg-green-600 text-white"
                      >
                        Served
                      </ButtonWithSpinner>
                      <ButtonWithSpinner
                        loading={!!actionLoading[a._id + "-no-show"]}
                        onClick={() => updateStatus(a._id, "no-show")}
                        className="bg-red-600 text-white"
                      >
                        No-show
                      </ButtonWithSpinner>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <ProviderProfileCard provider={profile} servedCount={summary.served} />
      </div>
    </div>
  );
}
