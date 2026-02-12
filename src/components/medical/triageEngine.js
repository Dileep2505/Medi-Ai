// ===== MINOR CONDITIONS SUPPORT =====
export const MINOR_CARE_DB = {
  "Fever (mild)": {
    adult: {
      male: ["Paracetamol for fever relief", "Hydration", "Rest"],
      female: ["Paracetamol for fever relief", "Hydration", "Rest"]
    },
    child: {
      male: ["Paracetamol pediatric dose (weight-based)", "Fluids"],
      female: ["Paracetamol pediatric dose (weight-based)", "Fluids"]
    },
    note: "If fever > 3 days → consult doctor"
  },

  "Tension Headache": {
    adult: {
      male: ["Paracetamol or Ibuprofen", "Hydration", "Rest"],
      female: ["Paracetamol (preferred)", "Hydration", "Stress relief"]
    },
    child: {
      male: ["Paracetamol pediatric dose"],
      female: ["Paracetamol pediatric dose"]
    }
  },

  "Common Cold": {
    adult: {
      male: ["Steam inhalation", "Saline nasal spray", "Antihistamine"],
      female: ["Steam inhalation", "Saline nasal spray", "Antihistamine"]
    },
    child: {
      male: ["Saline nasal spray", "Warm fluids"],
      female: ["Saline nasal spray", "Warm fluids"]
    }
  }
};

// ===== SERIOUS CONDITIONS REFERRAL =====
export const REFERRAL_DB = {
  "Chest Pain": "Cardiologist / Emergency",
  "High Blood Pressure": "Cardiologist",
  "Diabetes": "Endocrinologist",
  "Severe Anemia": "Hematologist",
  "Kidney Dysfunction": "Nephrologist",
  "Abnormal Liver Tests": "Gastroenterologist",
  "Shortness of Breath": "Pulmonologist",
  "Severe Headache + Vomiting": "Neurologist",
  "Thyroid Disorder": "Endocrinologist",
  "Cancer Suspicion": "Oncologist"
};

// ===== MAIN TRIAGE FUNCTION =====
export function triageCondition(condition, age, gender) {
  const group = age < 12 ? "child" : age > 60 ? "elderly" : "adult";

  // Minor condition
  if (MINOR_CARE_DB[condition]) {
    const care = MINOR_CARE_DB[condition]?.[group]?.[gender?.toLowerCase()];
    return {
      type: "minor",
      care: care || ["General supportive care"],
      note: MINOR_CARE_DB[condition].note || ""
    };
  }

  // Serious condition
  if (REFERRAL_DB[condition]) {
    return {
      type: "referral",
      consult: REFERRAL_DB[condition]
    };
  }

  // Unknown
  return {
    type: "unknown",
    consult: "General Physician"
  };
}
