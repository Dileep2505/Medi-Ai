import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { text = "", age = "", gender = "" } = req.body;

    if (!process.env.GROQ_API_KEY) {
      console.error("❌ GROQ KEY MISSING");
      return res.status(500).json({ error: "API key missing" });
    }

    console.log("🔍 Sending request to Groq...");

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: `
You MUST return ONLY valid JSON. No text, no explanation.

Format:
{
  "healthIssues": [
    {
      "title": "",
      "medicalTerm": "",
      "severity": "MILD | MODERATE | SEVERE",
      "confidence": 0,
      "whatIsThis": "",
      "whatItMeans": "",
      "whyItMatters": ""
    }
  ],
  "labResults": []
}
`
          },
          {
            role: "user",
            content: text || "No data provided"
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    let raw = response.data?.choices?.[0]?.message?.content;

    console.log("🧠 RAW AI RESPONSE:", raw);

    if (!raw) {
      return res.json({ healthIssues: [], labResults: [] });
    }

    // 🔥 CLEAN RESPONSE (remove markdown, text, etc.)
    raw = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsed;

    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.log("⚠️ Direct parse failed, trying extract...");

      const match = raw.match(/\{[\s\S]*\}/);

      if (!match) {
        return res.json({ healthIssues: [], labResults: [] });
      }

      try {
        parsed = JSON.parse(match[0]);
      } catch {
        return res.json({ healthIssues: [], labResults: [] });
      }
    }

    // 🔥 VALIDATION (VERY IMPORTANT)
    if (!parsed.healthIssues || !Array.isArray(parsed.healthIssues)) {
      console.log("⚠️ Invalid structure, fixing...");
      parsed.healthIssues = [];
    }

    if (!parsed.labResults || !Array.isArray(parsed.labResults)) {
      parsed.labResults = [];
    }

    res.json(parsed);

  } catch (err) {
    console.error("❌ AI ERROR:", err.response?.data || err.message);

    res.status(500).json({
      error: "AI request failed",
      details: err.response?.data || err.message
    });
  }
});

export default router;