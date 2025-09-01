import React from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Users, CalendarDays, PieChart, LogOut } from "lucide-react";

export default function AdminDashboardLayout() {
  const location = useLocation();
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "null");

  const logout = () => {
    localStorage.removeItem("userInfo");
    window.location.href = "/login";
  };

  const menu = [
    { name: "Overview", to: "/admin/dashboard", icon: PieChart },
    { name: "Users", to: "/admin/dashboard/users", icon: Users },
    {
      name: "Appointments",
      to: "/admin/dashboard/appointments",
      icon: CalendarDays,
    },
  ];

  return (
    <div className="bg-gradient-to-br from-indigo-100 via-white to-indigo-50">
      {/* Sidebar (fixed) */}
      <aside className="fixed top-0 left-0 h-screen w-64 bg-white/90 backdrop-blur-xl shadow-xl flex flex-col border-r z-40">
        {/* Logo + Admin Name */}
        <div className="p-6 border-b">
          <h2 className="text-2xl font-extrabold text-indigo-600">
            SmartQueue Admin
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {userInfo?.user?.full_name || "Administrator"}
          </p>
          <p className="text-xs text-gray-500">{userInfo?.user?.email}</p>
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col gap-2 p-4 text-gray-700 flex-1">
          {menu.map(({ name, to, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <NavLink
                key={to}
                to={to}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                  active
                    ? "bg-indigo-600 text-white shadow-md"
                    : "hover:bg-indigo-50 hover:text-indigo-600"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Header (fixed) */}
      <header className="fixed top-0 left-64 right-0 h-16 bg-white/90 backdrop-blur-md shadow flex items-center justify-between px-6 border-b z-30">
        <h2 className="text-lg font-semibold text-indigo-600">
          Admin Dashboard
        </h2>

        {/* Avatar + Name */}
        <div className="flex items-center gap-3 text-gray-700">
          <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shadow">
            {(userInfo?.user?.full_name || "A").charAt(0).toUpperCase()}
          </div>
          <span className="font-medium">
            {userInfo?.user?.full_name || "Admin"}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="ml-64 mt-16 p-6 min-h-screen overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
