import React, { useEffect, useMemo, useState } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { Loader2, Trash2 } from "lucide-react";

function SmallBtn({ loading, children, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`px-3 py-1 rounded text-sm ${className}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" />
      ) : null}
      {children}
    </button>
  );
}

export default function AdminAppointments() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [deleteLoading, setDeleteLoading] = useState({});
  const perPage = 10;

  const load = async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/appointments");
      setList(res.data || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const removeAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this appointment?"))
      return;
    setDeleteLoading((p) => ({ ...p, [id]: true }));
    try {
      await API.delete(`/admin/appointments/${id}`);
      toast.success("Appointment deleted");
      await load();
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete appointment");
    } finally {
      setDeleteLoading((p) => ({ ...p, [id]: false }));
    }
  };

  const filtered = useMemo(() => {
    if (filter === "all") return list;
    return list.filter((a) => (a.status || "").toLowerCase() === filter);
  }, [list, filter]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const pageData = filtered.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">All Appointments</h2>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded border bg-white text-sm"
          >
            <option value="all">All statuses</option>
            <option value="booked">Booked</option>
            <option value="serving">Serving</option>
            <option value="served">Served</option>
            <option value="cancelled">Cancelled</option>
            <option value="no-show">No-show</option>
          </select>
          <SmallBtn
            loading={loading}
            onClick={load}
            className="bg-indigo-600 text-white"
          >
            Refresh
          </SmallBtn>
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-gray-600">
          Loading appointments…
        </div>
      ) : pageData.length === 0 ? (
        <div className="py-6 text-center text-gray-600">
          No appointments found.
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageData.map((a, i) => (
                <tr key={a._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">{(page - 1) * perPage + i + 1}</td>

                  {/* Customer */}
                  <td className="px-4 py-3">
                    <div className="font-medium">
                      {a.user?.full_name || "User"}
                    </div>
                    <div className="text-xs text-gray-500">{a.user?.email}</div>
                  </td>

                  {/* Service */}
                  <td className="px-4 py-3">
                    {a.service?.service_name || "—"}
                  </td>

                  {/* When */}
                  <td className="px-4 py-3">
                    {a.datetime ? new Date(a.datetime).toLocaleString() : "—"}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        a.status === "booked"
                          ? "bg-blue-50 text-blue-700"
                          : a.status === "serving"
                          ? "bg-yellow-50 text-yellow-700"
                          : a.status === "served"
                          ? "bg-green-50 text-green-700"
                          : a.status === "cancelled"
                          ? "bg-red-50 text-red-700"
                          : "bg-gray-50 text-gray-700"
                      }`}
                    >
                      {(a.status || "").toUpperCase()}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => removeAppointment(a._id)}
                      disabled={deleteLoading[a._id]}
                      className="px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 flex items-center gap-1 text-sm"
                    >
                      {deleteLoading[a._id] ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">
          Showing {(page - 1) * perPage + 1} - {Math.min(page * perPage, total)}{" "}
          of {total}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded bg-white shadow disabled:opacity-50"
          >
            Prev
          </button>
          <div className="px-3 py-1 bg-white shadow rounded">
            {page} / {totalPages}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 rounded bg-white shadow disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
