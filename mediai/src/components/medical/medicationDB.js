export const DRUG_DB = {
  Paracetamol: {
    class: "Analgesic",
    adultDose: "500–1000 mg every 6 hours",
    pediatricDose: "15 mg/kg every 6 hours",
    maxDoseAdult: "4 g/day",
    contraindications: ["Severe liver disease"],
    interactions: ["Warfarin"]
  },

  Metformin: {
    class: "Biguanide",
    adultDose: "500 mg twice daily",
    contraindications: ["eGFR < 30", "Metabolic acidosis"],
    interactions: ["Iodinated contrast"]
  },

  Amlodipine: {
    class: "Calcium Channel Blocker",
    adultDose: "5 mg once daily",
    elderlyDose: "2.5 mg once daily",
    contraindications: ["Severe hypotension"],
    interactions: ["Simvastatin"]
  }
};

export const CONDITION_DRUG_MAP = {
  Fever: ["Paracetamol"],
  "Type 2 Diabetes": ["Metformin"],
  Hypertension: ["Amlodipine"]
};
