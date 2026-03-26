import Groq from "groq-sdk";

export async function analyzeWithLLM(text) {
  try {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      console.error("❌ GROQ KEY NOT LOADED");
      return { healthIssues: [] };
    }

    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0,
      messages: [
        {
          role: "system",
          content: `
Return ONLY JSON:
{
  "healthIssues": [
    {
      "name": "",
      "severity": "",
      "whatIsThis": "",
      "whatItMeans": "",
      "whyItMatters": "",
      "medications": []
    }
  ]
}`
        },
        {
          role: "user",
          content: text || "medical report provided"
        }
      ]
    });

    const content = completion.choices?.[0]?.message?.content;

    console.log("RAW AI:", content); // 🔥 CRITICAL DEBUG

    return JSON.parse(content);

  } catch (err) {
    console.error("❌ GROQ ERROR:", err.message || err);
    return { healthIssues: [] };
  }
}