import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-indigo-600">
          DevToolbox AI
        </Link>
        <div className="flex gap-6">
          <Link to="/json" className="text-gray-600 hover:text-indigo-600 transition-colors">
            JSON
          </Link>
          <Link to="/regex" className="text-gray-600 hover:text-indigo-600 transition-colors">
            Regex
          </Link>
          <Link to="/sql" className="text-gray-600 hover:text-indigo-600 transition-colors">
            SQL
          </Link>
        </div>
      </div>
    </nav>
  );
}
