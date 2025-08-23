// pages/api/qwen.js
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  if (req.method === "OPTIONS") return res.status(200).end();
  
  const { content } = req.query; // agar querystring se message aata hai
  const { message } = req.body || {};
  
  const userMsg = content || message;
  if (!userMsg) {
    return res.status(400).json({ error: "Message is required" });
  }
  
  try {
    // ⚠️ Direct Gemini API key use (visible)
    const GEMINI_KEY = "AIzaSyDATuXl_5gMVK4ULJiH3hvZ4PGHsDQhD0c"; // tumhari key yaha daal do
    
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: userMsg }] }],
        }),
      }
    );
    
    const geminiData = await geminiRes.json();
    const geminiAnswer =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠️ Gemini error";
    
    res.status(200).json({ answer: geminiAnswer });
  } catch (err) {
    console.error("Gemini API Error:", err);
    res.status(500).json({ error: "Gemini request failed" });
  }
}