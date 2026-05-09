const MIMO_BASE_URL =
  process.env.MIMO_BASE_URL || "https://token-plan-cn.xiaomimimo.com/v1/chat/completions";

async function callMimo(systemPrompt, userInput) {
  const res = await fetch(MIMO_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.MIMO_API_KEY}`,
    },
    body: JSON.stringify({
      model: "mimo-v2.5-pro",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userInput },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Mimo API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

module.exports = { callMimo };
