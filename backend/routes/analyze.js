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
Return STRICT JSON:
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

    const raw = response.data.choices?.[0]?.message?.content;

    console.log("🧠 RAW AI RESPONSE:", raw);

    if (!raw) {
      return res.json({ healthIssues: [], labResults: [] });
    }

    // safer parsing
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : null;
    }

    if (!parsed) {
      return res.json({ healthIssues: [], labResults: [] });
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