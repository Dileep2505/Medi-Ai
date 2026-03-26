export const analyzeHealthDataAI = async (text) => {
  try {
    const res = await fetch(
      "https://medi-ai-backend-226z.onrender.com/api/analyze",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      }
    );

    if (!res.ok) {
      throw new Error("Server error");
    }

    const data = await res.json();
    console.log("AI RESPONSE:", data);

    return data;

  } catch (err) {
    console.error("Frontend API error:", err);
    return { healthIssues: [], labResults: [] };
  }
};