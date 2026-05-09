import { Link } from "react-router-dom";

const tools = [
  {
    title: "JSON Formatter",
    description: "格式化、校验和压缩 JSON 数据",
    path: "/json",
    color: "bg-blue-50 border-blue-200 hover:border-blue-400",
  },
  {
    title: "Regex Generator",
    description: "用自然语言描述生成正则表达式",
    path: "/regex",
    color: "bg-green-50 border-green-200 hover:border-green-400",
  },
  {
    title: "SQL Optimizer",
    description: "分析并优化 SQL 查询语句",
    path: "/sql",
    color: "bg-purple-50 border-purple-200 hover:border-purple-400",
  },
];

export default function Home() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">DevToolbox AI</h1>
      <p className="text-gray-500 mb-8">AI 驱动的开发者工具集</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <Link
            key={tool.path}
            to={tool.path}
            className={`block p-6 rounded-xl border-2 transition-all ${tool.color}`}
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-2">{tool.title}</h2>
            <p className="text-gray-600 text-sm">{tool.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
