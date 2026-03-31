const API_BASE = "https://medi-ai-backend-226z.onrender.com";

export async function analyzeWithLLM(text) {
  const response = await fetch(`${API_BASE}/api/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error('LLM analysis failed');
  }

  return response.json();
}
