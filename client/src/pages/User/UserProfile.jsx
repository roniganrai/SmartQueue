import React from "react";

export default function UserProfile() {
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "null");
  const user = userInfo?.user || {};

  // Get avatar first letter (capital)
  const getInitial = (name) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="p-6 flex justify-center">
      <div className="w-full max-w-2xl bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8">
        {/* Avatar & Name */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-indigo-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg">
            {getInitial(user.full_name)}
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-gray-800">
            {user.full_name || "Unnamed User"}
          </h2>
          <p className="text-sm text-gray-500">{user.role || "—"}</p>
        </div>

        {/* Basic Info */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="p-4 bg-gray-50 rounded-xl shadow-sm">
            <p className="text-sm text-gray-500">📧 Email</p>
            <p className="mt-1 font-medium text-gray-800">
              {user.email || "-"}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl shadow-sm">
            <p className="text-sm text-gray-500">📱 Mobile</p>
            <p className="mt-1 font-medium text-gray-800">
              {user.mobile_number || "-"}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl shadow-sm">
            <p className="text-sm text-gray-500">🎭 Role</p>
            <p className="mt-1 font-medium text-gray-800">{user.role || "-"}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl shadow-sm">
            <p className="text-sm text-gray-500">🆔 User ID</p>
            <p className="mt-1 font-medium text-gray-800">{user._id || "-"}</p>
          </div>
        </div>

        {/* Service Details (if service provider) */}
        {user.role === "service" && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-indigo-700 mb-4">
              Service Details
            </h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-4 bg-gray-50 rounded-xl shadow-sm">
                <p className="text-sm text-gray-500">🏥 Service Name</p>
                <p className="mt-1 font-medium text-gray-800">
                  {user.service_name || "-"}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl shadow-sm">
                <p className="text-sm text-gray-500">📍 Location</p>
                <p className="mt-1 font-medium text-gray-800">
                  {user.service_location || "-"}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl shadow-sm">
                <p className="text-sm text-gray-500">👥 Staff Count</p>
                <p className="mt-1 font-medium text-gray-800">
                  {user.staff_count ?? "-"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Edit Button */}
        <div className="mt-10 flex justify-center">
          <button
            onClick={() => alert("Edit profile feature not implemented yet")}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-md"
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}
