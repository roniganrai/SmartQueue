import React from "react";

export default function ProviderProfileCard({ provider, servedCount }) {
  const name = provider?.service_name || provider?.full_name || "Service";
  const initial = (name || "S").charAt(0).toUpperCase();

  return (
    <div className="p-4 bg-white rounded-2xl shadow-sm ring-1 ring-gray-100">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xl">
          {initial}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-gray-900">{name}</div>
          <div className="text-sm text-gray-500">
            {provider?.service_location || "-"}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="p-3 bg-gray-50 rounded-lg text-center">
          <div className="text-xs text-gray-500">Staff</div>
          <div className="font-semibold text-gray-800">
            {provider?.staff_count ?? "-"}
          </div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg text-center">
          <div className="text-xs text-gray-500">Total Served</div>
          <div className="font-semibold text-indigo-700">
            {servedCount ?? provider?.totalServed ?? 0}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <a
          href="/service/dashboard/profile"
          className="inline-block w-full text-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Edit Profile
        </a>
      </div>
    </div>
  );
}
