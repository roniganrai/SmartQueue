import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";

export default function ServiceStaff() {
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState({ name: "", role: "", shift_schedule: "" });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await API.get("/service/staff");
      setStaff(res.data || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load staff");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e) => {
    e.preventDefault();
    if (!form.name) return toast.error("Name required");
    try {
      await API.post("/service/staff", form);
      toast.success("Added");
      setForm({ name: "", role: "", shift_schedule: "" });
      load();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Remove staff?")) return;
    try {
      await API.delete(`/service/staff/${id}`);
      toast.success("Removed");
      load();
    } catch (err) {
      console.error(err);
      toast.error("Failed");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Staff</h1>

      <form
        onSubmit={create}
        className="grid gap-3 grid-cols-1 md:grid-cols-3 bg-white p-4 rounded-2xl shadow-sm ring-1 ring-gray-100 mb-6"
      >
        <input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Name"
          className="p-2 border rounded"
        />
        <input
          value={form.role}
          onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
          placeholder="Role"
          className="p-2 border rounded"
        />
        <input
          value={form.shift_schedule}
          onChange={(e) =>
            setForm((f) => ({ ...f, shift_schedule: e.target.value }))
          }
          placeholder="Shift"
          className="p-2 border rounded"
        />
        <button className="md:col-span-3 px-4 py-2 bg-indigo-600 text-white rounded-lg">
          Add Staff
        </button>
      </form>

      {loading ? (
        <div>Loading...</div>
      ) : staff.length === 0 ? (
        <div className="p-4 bg-white rounded-2xl text-gray-500">
          No staff yet
        </div>
      ) : (
        <div className="space-y-3">
          {staff.map((s) => (
            <div
              key={s._id}
              className="p-3 bg-white rounded-lg flex justify-between items-center shadow-sm"
            >
              <div>
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-gray-500">
                  {s.role} {s.shift_schedule ? `• ${s.shift_schedule}` : ""}
                </div>
              </div>
              <div>
                <button
                  onClick={() => remove(s._id)}
                  className="px-3 py-1 rounded bg-red-500 text-white"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
