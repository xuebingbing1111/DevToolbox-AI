import { useState } from "react";

export default function RegexGenerator() {
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
      const res = await fetch("https://devtoolbox-ai-production.up.railway.app/api/ai/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "regex", userInput: input }),
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

  // 从 AI 返回内容中分离正则和解释
  const parseResult = (text) => {
    if (!text) return { pattern: "", explanation: text };
    const regexMatch = text.match(/```(?:regex)?\s*([\s\S]*?)```/);
    const pattern = regexMatch ? regexMatch[1].trim() : "";
    let explanation = pattern ? text.replace(regexMatch[0], "").trim() : text;
    // 去掉解释开头可能残留的正则行
    if (pattern && explanation.startsWith(pattern)) {
      explanation = explanation.slice(pattern.length).trim();
    }
    return { pattern, explanation };
  };

  // 将解释文本按换行或序号拆成列表项
  const renderExplanation = (text) => {
    if (!text) return null;
    // 按数字序号或换行拆分
    const lines = text.split(/\n+/).filter((l) => l.trim());
    if (lines.length <= 1) {
      return <p className="text-gray-700 text-sm whitespace-pre-wrap">{text}</p>;
    }
    return (
      <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
        {lines.map((line, i) => (
          <li key={i} className="leading-relaxed">
            {line.replace(/^\d+[.、)\]]\s*/, "")}
          </li>
        ))}
      </ol>
    );
  };

  const { pattern, explanation } = parseResult(result);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Regex Generator</h1>
      <p className="text-gray-500 mb-6">用自然语言描述，AI 帮你生成正则表达式</p>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <input
          type="text"
          className="w-full p-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="描述你需要的正则，例如“匹配国内手机号码”"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
        <button
          className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          onClick={handleSubmit}
          disabled={status === "loading"}
        >
          {status === "loading" ? "生成中..." : "生成正则"}
        </button>
      </div>

      {status === "loading" && (
        <div className="mt-6 flex items-center gap-3 text-gray-500">
          <svg className="animate-spin h-5 w-5 text-indigo-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <span>AI 正在生成正则表达式...</span>
        </div>
      )}

      {status === "success" && (
        <div className="mt-6 space-y-4">
          {pattern && (
            <div>
              <h2 className="text-lg font-semibold text-green-700 mb-2">正则表达式</h2>
              <code className="block bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono break-all">
                {pattern}
              </code>
            </div>
          )}
          {explanation && (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">解释说明</h2>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                {renderExplanation(explanation)}
              </div>
            </div>
          )}
          {!pattern && !explanation && (
            <pre className="bg-gray-100 text-gray-800 p-4 rounded-lg overflow-auto text-sm font-mono border border-gray-200">
              {result}
            </pre>
          )}
        </div>
      )}

      {status === "error" && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-700 mb-2">生成失败</h2>
          <p className="text-red-800 whitespace-pre-wrap">{error || result}</p>
        </div>
      )}
    </div>
  );
}
