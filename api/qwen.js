export default async function handler(req, res) {
  try {
    const { chat_id, content } = req.query;
    
    if (!chat_id || !content) {
      return res.status(400).json({ error: "chat_id and content are required" });
    }
    
    // Forward request to real Qwen API (replace with actual endpoint)
    const apiRes = await fetch("https://qwen.a3z.workers.dev/api/completions?" +
      new URLSearchParams({
        chat_id,
        content
      })
    );
    
    const data = await apiRes.json();
    
    // Agar response ke andar alag-alag naam ho to normalize karke bhejenge
    const answer =
      data.answer ||
      data.response ||
      data.output ||
      data.result ||
      data.choices?.[0]?.message?.content ||
      null;
    
    return res.status(200).json({
      chat_id,
      question: content,
      answer,
      raw: data
    });
  } catch (err) {
    console.error("Proxy error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}