import { useState } from "react";

export default function SqlOptimizer() {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setStatus("loading");
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/ai/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "sql", userInput: input }),
      });

      if (!res.ok) {
        throw new Error(`服务器返回 ${res.status}`);
      }

      const data = await res.json();

      if (data.status === "success") {
        setStatus("success");
        setResult(data.result);
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

  // 将 AI 返回文本分段渲染
  const renderSections = (text) => {
    if (!text) return null;

    if (text.includes("无需优化")) {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <svg className="h-6 w-6 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-green-800 font-medium">{text}</p>
        </div>
      );
    }

    const sections = [];
    const patterns = [
      { key: "analysis", label: "分析", marker: "分析：", bg: "bg-yellow-50", border: "border-yellow-200", title: "text-yellow-800", body: "text-yellow-900" },
      { key: "suggestion", label: "建议", marker: "建议：", bg: "bg-blue-50", border: "border-blue-200", title: "text-blue-800", body: "text-blue-900" },
      { key: "optimized", label: "优化后 SQL", marker: "优化后SQL：", bg: "bg-green-50", border: "border-green-200", title: "text-green-800", body: "text-green-900", code: true },
    ];

    // 也支持不带冒号的标记
    const allMarkers = patterns.flatMap((p) => [
      p.marker,
      p.marker.replace("：", ":"),
      p.marker.replace("：", ""),
    ]);

    let remaining = text;
    for (const p of patterns) {
      const markers = [p.marker, p.marker.replace("：", ":"), p.marker.replace("：", "")];
      for (const m of markers) {
        const idx = remaining.indexOf(m);
        if (idx !== -1) {
          const afterMarker = remaining.slice(idx + m.length);
          // 找下一个标记的位置
          let endIdx = afterMarker.length;
          for (const om of allMarkers) {
            const ni = afterMarker.indexOf(om);
            if (ni !== -1 && ni < endIdx) endIdx = ni;
          }
          const content = afterMarker.slice(0, endIdx).trim();
          sections.push({ ...p, content });
          remaining = remaining.slice(idx + m.length + endIdx);
          break;
        }
      }
    }

    if (sections.length === 0) {
      return (
        <pre className="bg-gray-100 text-gray-800 p-4 rounded-lg overflow-auto text-sm font-mono border border-gray-200">
          {text}
        </pre>
      );
    }

    return (
      <div className="space-y-4">
        {sections.map((s) => (
          <div key={s.key} className={`${s.bg} border ${s.border} rounded-lg p-4`}>
            <h3 className={`font-semibold ${s.title} mb-2`}>{s.label}</h3>
            {s.code ? (
              <pre className={`${s.body} font-mono text-sm whitespace-pre-wrap`}>{s.content}</pre>
            ) : (
              <p className={`${s.body} text-sm whitespace-pre-wrap`}>{s.content}</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">SQL Optimizer</h1>
      <p className="text-gray-500 mb-6">分析并优化你的 SQL 查询语句</p>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <textarea
          className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="粘贴你的 SQL 语句..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          onClick={handleSubmit}
          disabled={status === "loading"}
        >
          {status === "loading" ? "分析中..." : "优化分析"}
        </button>
      </div>

      {status === "loading" && (
        <div className="mt-6 flex items-center gap-3 text-gray-500">
          <svg className="animate-spin h-5 w-5 text-indigo-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <span>AI 正在分析你的 SQL...</span>
        </div>
      )}

      {status === "success" && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">分析结果</h2>
          {renderSections(result)}
        </div>
      )}

      {status === "error" && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-700 mb-2">分析失败</h2>
          <p className="text-red-800 whitespace-pre-wrap">{error || result}</p>
        </div>
      )}
    </div>
  );
}
