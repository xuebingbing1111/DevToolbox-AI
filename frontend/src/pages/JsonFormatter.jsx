import { useState } from "react";

export default function JsonFormatter() {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | valid | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setStatus("loading");
    setResult(null);
    setError(null);

    try {
      const res = await fetch("https://devtoolbox-ai-production.up.railway.app/api/ai/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "json", userInput: input }),
      });

      if (!res.ok) {
        throw new Error(`服务器返回 ${res.status}`);
      }

      const data = await res.json();

      if (data.status === "valid") {
        setStatus("valid");
        setResult(data.formatted);
      } else if (data.status === "error") {
        setStatus("error");
        setResult(data.aiExplanation);
      } else {
        throw new Error(data.message || "未知响应");
      }
    } catch (err) {
      setStatus("error");
      setError(err.message || "请求失败，请检查后端服务是否运行。");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">JSON Formatter</h1>
      <p className="text-gray-500 mb-6">格式化、校验并用 AI 解释 JSON 错误</p>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <textarea
          className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="粘贴你的JSON到这里…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          onClick={handleSubmit}
          disabled={status === "loading"}
        >
          {status === "loading" ? "解析中..." : "格式化 / 解释"}
        </button>
      </div>

      {status === "loading" && (
        <div className="mt-6 flex items-center gap-3 text-gray-500">
          <svg className="animate-spin h-5 w-5 text-indigo-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <span>AI 正在分析你的 JSON...</span>
        </div>
      )}

      {status === "valid" && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-green-700 mb-2">JSON 合法</h2>
          <pre className="bg-gray-100 text-gray-800 p-4 rounded-lg overflow-auto text-sm font-mono border border-gray-200">
            {result}
          </pre>
        </div>
      )}

      {status === "error" && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-700 mb-2">JSON 解析失败</h2>
          <p className="text-red-800 whitespace-pre-wrap">{error || result}</p>
        </div>
      )}
    </div>
  );
}
