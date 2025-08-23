// api/qwen.js
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  if (req.method === "OPTIONS") return res.status(200).end();
  
  const { chat_id, content } = req.query;
  
  try {
    const qwenRes = await fetch(`https://qwen.a3z.workers.dev/api/completions?chat_id=${chat_id}&content=${encodeURIComponent(content)}`);
    const data = await qwenRes.json();
    
    res.status(200).json({
      answer: data.response || "⚠️ No answer from Qwen"
    });
  } catch (err) {
    console.error("Proxy Error:", err);
    res.status(500).json({ error: "Proxy request failed" });
  }
}