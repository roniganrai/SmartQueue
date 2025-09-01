import React, { useEffect, useMemo, useState } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

//Small ButtonWithSpinner local to avoid external dependency
function ButtonWithSpinner({
  loading,
  children,
  onClick,
  className = "",
  disabled = false,
}) {
  const isDisabled = disabled || loading;
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`px-3 py-1 rounded text-sm font-medium transition ${
        isDisabled ? "opacity-60 cursor-not-allowed" : "hover:shadow"
      } ${className}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" />
      ) : null}
      <span>{children}</span>
    </button>
  );
}

export default function AdminUsers() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [roleLoading, setRoleLoading] = useState({});
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteLoading, setDeleteLoading] = useState({});
  const perPage = 10;

  const removeUser = async (id) => {
    if (!window.confirm("Are you sure you want to remove this user?")) return;
    setDeleteLoading((p) => ({ ...p, [id]: true }));
    try {
      await API.delete(`/admin/users/${id}`);
      toast.success("User removed");
      await load();
    } catch (e) {
      console.error(e);
      toast.error("Failed to remove user");
    } finally {
      setDeleteLoading((p) => ({ ...p, [id]: false }));
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/users");
      setList(res.data || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const changeRole = async (id, role) => {
    setRoleLoading((p) => ({ ...p, [id]: role }));
    try {
      await API.put(`/admin/users/${id}/role`, { role });
      toast.success("Role updated");
      await load();
    } catch (e) {
      console.error(e);
      toast.error("Failed to update role");
    } finally {
      setRoleLoading((p) => ({ ...p, [id]: false }));
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (u) =>
        (u.full_name || u.service_name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q)
    );
  }, [list, search]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const pageData = filtered.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Users</h2>
        <div className="flex items-center gap-2">
          <input
            placeholder="Search name or email"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-lg border bg-white text-sm"
          />
          <ButtonWithSpinner
            onClick={load}
            loading={loading}
            className="bg-indigo-600 text-white"
          >
            Refresh
          </ButtonWithSpinner>
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-gray-600">Loading users…</div>
      ) : pageData.length === 0 ? (
        <div className="py-6 text-center text-gray-600">No users found.</div>
      ) : (
        <div className="space-y-3">
          {pageData.map((u) => (
            <div
              key={u._id}
              className="p-3 bg-white rounded-lg shadow flex items-center justify-between"
            >
              <div>
                <div className="font-medium">
                  {u.full_name || u.service_name || "(no name)"}
                </div>
                <div className="text-sm text-gray-500">
                  {u.email} • <span className="font-semibold">{u.role}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ButtonWithSpinner
                  loading={deleteLoading[u._id]}
                  onClick={() => removeUser(u._id)}
                  className="bg-red-500 text-white hover:bg-red-600"
                >
                  Remove
                </ButtonWithSpinner>
              </div>
            </div>
          ))}
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
