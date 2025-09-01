import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import { toast } from "react-hot-toast";

export default function ServiceQueue() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // Load queue from backend
  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await API.get("/service/queue");
      setQueue(res.data);
    } catch (err) {
      console.error("Queue fetch error:", err);
      toast.error("Failed to load queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  // Update appointment status (serving / served / no-show)
  const updateStatus = async (id, action) => {
    try {
      setActionLoading(id + "-" + action); // set spinner for this button
      await API.put(`/service/queue/${id}`, { action });
      toast.success(`Appointment marked as ${action}`);
      fetchQueue(); // refresh list
    } catch (err) {
      console.error("Update status error:", err);
      toast.error("Failed to update appointment");
    } finally {
      setActionLoading(null); // reset spinner
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-indigo-700 mb-4">Live Queue</h2>

      {loading ? (
        <div className="text-gray-500">Loading queue...</div>
      ) : queue.length === 0 ? (
        <div className="text-gray-500">No active appointments in queue</div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full bg-white">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="px-4 py-2 text-left">#</th>
                <th className="px-4 py-2 text-left">Customer</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Wait (mins)</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {queue.map((appt, idx) => (
                <tr key={appt._id} className="border-t">
                  <td className="px-4 py-2">{idx + 1}</td>
                  <td className="px-4 py-2">{appt.user?.full_name}</td>
                  <td className="px-4 py-2">{appt.user?.email}</td>
                  <td className="px-4 py-2 font-medium">
                    {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                  </td>
                  <td className="px-4 py-2">
                    {appt.status === "booked" ? appt.estimated_wait_mins : "-"}
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    {appt.status === "booked" && (
                      <button
                        onClick={() => updateStatus(appt._id, "serving")}
                        disabled={actionLoading === appt._id + "-serving"}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {actionLoading === appt._id + "-serving" ? (
                          <span className="flex items-center">
                            <svg
                              className="animate-spin h-4 w-4 mr-2 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8H4z"
                              ></path>
                            </svg>
                            Processing...
                          </span>
                        ) : (
                          "Start Serving"
                        )}
                      </button>
                    )}

                    {appt.status === "serving" && (
                      <>
                        <button
                          onClick={() => updateStatus(appt._id, "served")}
                          disabled={actionLoading === appt._id + "-served"}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {actionLoading === appt._id + "-served" ? (
                            <span className="flex items-center">
                              <svg
                                className="animate-spin h-4 w-4 mr-2 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8v8H4z"
                                ></path>
                              </svg>
                              Saving...
                            </span>
                          ) : (
                            "Mark Served"
                          )}
                        </button>

                        <button
                          onClick={() => updateStatus(appt._id, "no-show")}
                          disabled={actionLoading === appt._id + "-no-show"}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {actionLoading === appt._id + "-no-show" ? (
                            <span className="flex items-center">
                              <svg
                                className="animate-spin h-4 w-4 mr-2 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8v8H4z"
                                ></path>
                              </svg>
                              Updating...
                            </span>
                          ) : (
                            "No Show"
                          )}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
