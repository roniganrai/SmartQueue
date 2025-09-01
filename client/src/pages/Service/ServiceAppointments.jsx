import React, { useEffect, useMemo, useState } from "react";
import API from "../../api/axios";
import ButtonWithSpinner from "../../components/service/ButtonWithSpinner";

export default function ServiceAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await API.get("/service/appointments");
      setAppointments(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Appointments</h1>
      {loading ? (
        <div>Loading...</div>
      ) : appointments.length === 0 ? (
        <div className="p-6 bg-white rounded-2xl text-gray-500">
          No appointments found
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a, i) => (
                <tr key={a._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{a.user?.full_name}</div>
                    <div className="text-xs text-gray-500">{a.user?.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    {new Date(a.datetime).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    {(a.status || "booked").toUpperCase()}
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
