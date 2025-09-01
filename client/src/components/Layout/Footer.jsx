export default function Footer() {
  return (
    <footer className="bg-white/80 backdrop-blur-lg border-t mt-10">
      <div className="max-w-7xl mx-auto px-6 py-6 text-center text-gray-600">
        © {new Date().getFullYear()} SmartQueue. All rights reserved.
      </div>
    </footer>
  );
}
