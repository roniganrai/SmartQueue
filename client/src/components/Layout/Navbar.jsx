import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white shadow">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-extrabold text-indigo-600">
          SmartQueue
        </Link>
        <nav className="space-x-4 flex items-center">
          <Link
            to="/login"
            className="text-gray-700 hover:text-indigo-600 transition"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Sign Up
          </Link>
        </nav>
      </div>
    </header>
  );
}
