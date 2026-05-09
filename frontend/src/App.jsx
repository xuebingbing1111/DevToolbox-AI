import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import JsonFormatter from "./pages/JsonFormatter";
import RegexGenerator from "./pages/RegexGenerator";
import SqlOptimizer from "./pages/SqlOptimizer";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/json" element={<JsonFormatter />} />
          <Route path="/regex" element={<RegexGenerator />} />
          <Route path="/sql" element={<SqlOptimizer />} />
        </Routes>
      </main>
    </div>
  );
}
