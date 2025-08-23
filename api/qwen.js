export default async function handler(req, res) {
  // ✅ Always allow CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  
  try {
    // Params from client
    const { chat_id = "default", content } = req.method === "GET" ?
      req.query :
      JSON.parse(req.body || "{}");
    
    if (!content) return res.status(400).json({ error: "Missing content" });
    
    // Forward to Qwen worker
    const target = `https://qwen.a3z.workers.dev/api/completions?chat_id=${encodeURIComponent(chat_id)}&content=${encodeURIComponent(content)}`;
    const qwenResp = await fetch(target);
    
    const data = await qwenResp.json();
    
    // Normalize JSON: always { answer: ... }
    const answer =
      data?.answer ??
      data?.completion ??
      data?.output ??
      data?.text ??
      data?.choices?.[0]?.message?.content ??
      data?.choices?.[0]?.text ??
      null;
    
    res.status(200).json({ answer, raw: data });
  } catch (e) {
    res.status(500).json({ error: "Proxy failed", detail: String(e) });
  }
}