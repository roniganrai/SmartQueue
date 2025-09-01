import Navbar from "./Layout/Navbar";
import Footer from "./Layout/Footer";
import { motion } from "framer-motion";
import WeatherWidget from "./WeatherWidget";

export default function Landing() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Static Navbar */}
      <Navbar />

      <main className="flex-1 pt-24">
        {/* Hero Section */}
        <section className="py-24 bg-gradient-to-br from-indigo-100 via-white to-indigo-50">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight"
            >
              Manage Your Time Smarter with{" "}
              <span className="text-indigo-600">SmartQueue</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
            >
              Skip the long lines. Book appointments instantly, track queue
              status in real time, and receive smart notifications — all in one
              place.
            </motion.p>

            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="/register"
              className="px-8 py-3 rounded-lg bg-indigo-600 text-white text-lg font-medium hover:bg-indigo-700 transition"
            >
              Get Started
            </motion.a>
          </div>
        </section>

        {/* Why SmartQueue Section */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-12">
              Why Choose SmartQueue?
            </h2>

            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  title: "⏱ Save Time",
                  desc: "Avoid endless waiting by booking smarter. SmartQueue optimizes queues to keep your day efficient.",
                },
                {
                  title: "📅 Easy Appointments",
                  desc: "Book, or cancel appointments in seconds — anywhere, anytime.",
                },
                {
                  title: "🔔 Stay Informed",
                  desc: "Get instant reminders, notifications, and live updates so you never miss your turn.",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 * i }}
                  className="p-8 rounded-2xl bg-indigo-50 shadow-lg hover:shadow-xl transition"
                >
                  <h3 className="text-xl font-semibold text-indigo-700 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Weather Section */}
        <section className="py-20 bg-gradient-to-r from-indigo-50 to-indigo-100">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold text-gray-800 mb-8">
              Check Weather Before You Step Out
            </h2>
            <WeatherWidget />
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
