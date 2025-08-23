// pages/api/qwen.js
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  if (req.method === "OPTIONS") return res.status(200).end();
  
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }
  
  try {
    // 1️⃣ Qwen API Call
    const qwenRes = await fetch(
      `https://qwen.a3z.workers.dev/api/completions?chat_id=1fc866d6-6ab1-4af1-b9f8-99ac2b5e4574&content=${encodeURIComponent(
        message
      )}`
    );
    const qwenData = await qwenRes.json();
    const qwenAnswer = qwenData.response || "⚠️ No answer from Qwen";
    
    console.log("Qwen →", qwenAnswer);
    
    // 2️⃣ Gemini API Call (Qwen output ko Gemini ko bhejna)
    const geminiRes = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
      process.env.GEMINI_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: qwenAnswer }] }],
        }),
      }
    );
    
    const geminiData = await geminiRes.json();
    const geminiAnswer =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠️ Gemini error";
    
    // 3️⃣ Dono response return karo
    res.status(200).json({
      qwen: qwenAnswer,
      gemini: geminiAnswer,
    });
  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}