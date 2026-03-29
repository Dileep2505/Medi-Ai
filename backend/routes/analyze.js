import express from "express";
import axios from "axios";

const router = express.Router();

/* ================= AGE SAFE MEDICATION RULES ================= */

const getMedications = (text, age, gender) => {
  const meds = [];

  const isChild = age && age < 12;
  const isAdult = age && age >= 12;

  /* ===== FEVER ===== */
  if (text.includes("fever")) {
    if (isChild) {
      meds.push("Paracetamol (pediatric use only – consult doctor)");
    } else {
      meds.push("Paracetamol (follow label instructions)");
    }
  }

  /* ===== HEADACHE ===== */
  if (text.includes("headache")) {
    if (isChild) {
      meds.push("Paracetamol preferred (avoid strong painkillers)");
    } else {
      meds.push("Ibuprofen (if suitable)");
    }
  }

  /* ===== COUGH ===== */
  if (text.includes("cough")) {
    if (isChild) {
      meds.push("Honey-based syrup (avoid strong OTC meds)");
    } else {
      meds.push("Cough syrup (consult pharmacist)");
    }
  }

  /* ===== COLD ===== */
  if (text.includes("cold")) {
    meds.push("Antihistamines (age-appropriate OTC)");
  }

  /* ===== GENDER NOTES ===== */
  if (gender === "female") {
    meds.push("Avoid medication if pregnant without doctor advice");
  }

  return meds;
};

/* ================= PRECAUTIONS ================= */

const getPrecautions = (text) => {
  const precautions = [];

  if (text.includes("fever")) {
    precautions.push("Stay hydrated", "Take rest");
  }

  if (text.includes("headache")) {
    precautions.push("Reduce screen time", "Rest in quiet environment");
  }

  if (text.includes("cough")) {
    precautions.push("Drink warm fluids", "Avoid cold exposure");
  }

  return precautions;
};

/* ================= RED FLAGS ================= */

const getRedFlags = (text) => {
  const flags = [];

  if (text.includes("chest pain")) {
    flags.push("Possible cardiac issue");
  }

  if (text.includes("breathing")) {
    flags.push("Respiratory distress");
  }

  if (text.includes("unconscious")) {
    flags.push("Emergency condition");
  }

  if (text.includes("high fever")) {
    flags.push("Persistent high fever");
  }

  return flags;
};

/* ================= SEVERITY ================= */

const getSeverity = (text) => {
  if (
    text.includes("chest pain") ||
    text.includes("breathing") ||
    text.includes("severe")
  ) {
    return "HIGH";
  }

  if (text.includes("persistent") || text.includes("3 days")) {
    return "MEDIUM";
  }

  return "LOW";
};

/* ================= MAIN ROUTE ================= */

router.post("/", async (req, res) => {
  try {
    const { text = "", age = 0, gender = "" } = req.body;

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: "API key missing" });
    }

    const lowerText = text.toLowerCase();

    /* ================= AI ANALYSIS ================= */

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
  ]
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

    let parsed;

    try {
      parsed = JSON.parse(raw);
    } catch {
      const match = raw?.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : { healthIssues: [] };
    }

    /* ================= SAFE LOGIC ================= */

    const medications = getMedications(lowerText, age, gender);
    const precautions = getPrecautions(lowerText);
    const redFlags = getRedFlags(lowerText);
    const severity = getSeverity(lowerText);

    /* ================= FINAL RESPONSE ================= */

    res.json({
      healthIssues: parsed.healthIssues || [],
      medications,
      precautions,
      redFlags,
      severity,
      ageGroup: age < 12 ? "child" : "adult",
      advice:
        severity === "HIGH"
          ? "Seek immediate medical attention"
          : "Monitor symptoms and consult doctor if needed"
    });

  } catch (err) {
    console.error("❌ AI ERROR:", err.response?.data || err.message);

    res.status(500).json({
      error: "AI request failed"
    });
  }
});

export default router;