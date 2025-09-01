import React from "react";

export default function StatCard({
  title,
  value,
  icon: Icon,
  accent = "indigo",
}) {
  const accentBg = {
    indigo: "bg-indigo-50 text-indigo-700",
    green: "bg-green-50 text-green-700",
    red: "bg-red-50 text-red-700",
    amber: "bg-amber-50 text-amber-700",
  }[accent];

  return (
    <div className="p-4 bg-white rounded-2xl shadow-sm ring-1 ring-gray-100">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">{title}</div>
        {Icon && (
          <div className={`p-2 rounded-lg ${accentBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div
        className={`mt-3 text-2xl font-bold ${
          accent === "indigo"
            ? "text-indigo-700"
            : accent === "green"
            ? "text-green-700"
            : accent === "red"
            ? "text-red-700"
            : "text-amber-700"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
