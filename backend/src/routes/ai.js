const express = require("express");
const router = express.Router();
const { callMimo } = require("../services/mimo");

const PROMPT_REGEX = `你是一个正则表达式生成专家，专注于将自然语言描述转化为精确的正则表达式。当用户提供描述（如"匹配国内手机号"）时，你必须：

生成功能正确、高效的正则表达式，适配常见编程语言（如Python/JavaScript）。
先输出完整的正则表达式（用斜杠包裹，例如 /^...$/）。
随后以"解释："开头，用中文逐行分解正则的每一部分，说明其匹配逻辑和作用（例如：^ 表示字符串开头，\\d{3} 匹配3位数字）。
解释需简洁清晰，避免技术术语堆砌，确保开发者能直接理解实现原理。`;

const PROMPT_SQL = `你是一个资深SQL性能优化顾问，专注于识别和解决查询效率问题。当用户提供一条SQL语句时，你必须：

分析：逐点指出潜在性能瓶颈（如全表扫描、缺失索引、低效JOIN等），若无问题则说明高效原因（如合理利用索引、避免子查询等）。
建议：给出具体、可操作的优化建议（如"为user_id添加B-Tree索引"或"重写WHERE条件减少数据扫描量"）。
优化后SQL：输出改写后的完整SQL语句（保留原逻辑但提升性能），若原SQL已最优则标注"无需优化"并重复原语句。
输出严格按此格式：
分析：[问题列表或高效原因]
建议：[优化步骤]
优化后SQL：[改写后的SQL]`;

router.post("/process", async (req, res) => {
  const { tool, userInput } = req.body;

  if (tool === "json") {
    try {
      const parsed = JSON.parse(userInput);
      return res.json({
        status: "valid",
        formatted: JSON.stringify(parsed, null, 2),
      });
    } catch (e) {
      const systemPrompt = `你是一个JSON修复专家。用户输入了一段错误的JSON字符串，错误信息是：${e.message}。请用中文指出错误位置和原因，并给出修正后的完整JSON。只返回修正后的JSON，不要额外解释。`;
      try {
        const aiExplanation = await callMimo(systemPrompt, userInput);
        return res.json({ status: "error", aiExplanation });
      } catch (err) {
        console.error("AI process error:", err);
        return res.status(500).json({ status: "error", aiExplanation: `AI 服务调用失败: ${err.message}` });
      }
    }
  }

  if (tool === "regex") {
    try {
      const aiResult = await callMimo(PROMPT_REGEX, userInput);
      return res.json({ status: "success", result: aiResult });
    } catch (err) {
      console.error("AI process error:", err);
      return res.status(500).json({ status: "error", result: "AI 服务调用失败: " + err.message });
    }
  }

  if (tool === "sql") {
    try {
      const aiResult = await callMimo(PROMPT_SQL, userInput);
      return res.json({ status: "success", result: aiResult });
    } catch (err) {
      console.error("AI process error:", err);
      return res.status(500).json({ status: "error", result: "AI 服务调用失败: " + err.message });
    }
  }

  return res.json({ message: "工具尚未实现" });
});

module.exports = router;
