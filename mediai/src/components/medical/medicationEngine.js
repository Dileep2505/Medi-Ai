export const MED_DB = {

/* ================= GENERAL ================= */
fever: {
  child: [{ name: "Paracetamol", dose: "250mg q6h", form: "Syrup" }],
  adult: [
    { name: "Paracetamol", dose: "500mg q6h", form: "Tablet" },
    { name: "Ibuprofen", dose: "400mg q8h", form: "Tablet" }
  ],
  elderly: [{ name: "Paracetamol", dose: "500mg q8h", form: "Tablet" }]
},

fatigue: {
  adult: [{ name: "Multivitamin", dose: "Once daily", form: "Tablet" }],
  elderly: [{ name: "Vitamin B complex", dose: "Daily", form: "Tablet" }]
},

body_ache: {
  adult: [{ name: "Paracetamol", dose: "500mg", form: "Tablet" }]
},

dizziness: {
  adult: [{ name: "Meclizine", dose: "25mg", form: "Tablet" }]
},

/* ================= RESPIRATORY ================= */
cold: {
  child: [{ name: "Cetirizine", dose: "5mg", form: "Syrup" }],
  adult: [
    { name: "Cetirizine", dose: "10mg", form: "Tablet" },
    { name: "Dextromethorphan", dose: "10ml", form: "Syrup" }
  ],
  elderly: [{ name: "Loratadine", dose: "10mg", form: "Tablet" }]
},

cough: {
  adult: [{ name: "Guaifenesin", dose: "10ml", form: "Syrup" }]
},

sore_throat: {
  adult: [{ name: "Lozenges", dose: "As needed", form: "Oral" }]
},

sinus_congestion: {
  adult: [{ name: "Saline nasal spray", dose: "2 sprays", form: "Spray" }]
},

/* ================= PAIN ================= */
headache: { adult: [{ name: "Paracetamol", dose: "500mg", form: "Tablet" }] },
back_pain: { adult: [{ name: "Diclofenac gel", dose: "Topical", form: "Gel" }] },
joint_pain: { adult: [{ name: "Ibuprofen gel", dose: "Topical", form: "Gel" }] },

/* ================= DIGESTIVE ================= */
acidity: {
  adult: [
    { name: "Antacid", dose: "After meals", form: "Tablet" },
    { name: "Famotidine", dose: "20mg", form: "Tablet" }
  ]
},

constipation: { adult: [{ name: "Psyllium", dose: "Daily", form: "Powder" }] },
diarrhea: { adult: [{ name: "ORS", dose: "Frequent", form: "Solution" }] },
gas_bloating: {
  child: [
    { name: "Simethicone", dose: "As needed", form: "Drops" }
  ],
  adult: [
    { name: "Simethicone", dose: "After meals", form: "Tablet" },
    { name: "Antacid", dose: "After meals", form: "Tablet" }
  ],
  elderly: [
    { name: "Simethicone", dose: "After meals", form: "Tablet" }
  ]
},

/* ================= SKIN ================= */
rash: { adult: [{ name: "Hydrocortisone", dose: "Apply", form: "Cream" }] },
fungal_infection: { adult: [{ name: "Clotrimazole", dose: "Apply", form: "Cream" }] },
acne: { adult: [{ name: "Benzoyl peroxide", dose: "Apply", form: "Gel" }] },

/* ================= NEURO MILD ================= */
anxiety: { adult: [{ name: "Hydroxyzine", dose: "10mg", form: "Tablet" }] },
insomnia: { adult: [{ name: "Melatonin", dose: "3mg", form: "Tablet" }] },

/* ================= ALLERGY ================= */
allergy: { adult: [{ name: "Loratadine", dose: "10mg", form: "Tablet" }] },

/* ================= EYE/ENT ================= */
conjunctivitis: { adult: [{ name: "Lubricant drops", dose: "3x daily", form: "Drops" }] },
ear_pain: { adult: [{ name: "Paracetamol", dose: "500mg", form: "Tablet" }] },
toothache: { adult: [{ name: "Paracetamol", dose: "500mg", form: "Tablet" }] }

};

/* Age + Gender Logic */
export const getMedications = (condition, age, gender) => {
  if (!condition) return [];

  const n = condition.toLowerCase();

  // 🔥 MASTER CONDITION MAPPER
  let key = null;

  if (n.includes("fever")) key = "fever";
  else if (n.includes("cold") || n.includes("cough")) key = "cold";
  else if (n.includes("headache")) key = "headache";
  else if (n.includes("stomach") || n.includes("abdominal") || n.includes("gastric") || n.includes("belly"))
    key = "gas_bloating";
  else if (n.includes("acidity") || n.includes("heartburn")) key = "acidity";
  else if (n.includes("constipation")) key = "constipation";
  else if (n.includes("diarrhea")) key = "diarrhea";
  else if (n.includes("rash")) key = "rash";
  else if (n.includes("fungal")) key = "fungal_infection";
  else if (n.includes("allergy")) key = "allergy";

  if (!key) return [];

  const data = MED_DB[key];
  if (!data) return [];

  let group = "adult";
  if (age < 12) group = "child";
  else if (age >= 65) group = "elderly";

  return data[group] || [];
};


/* ===============================
   TRIAGE / EMERGENCY CHECK
================================= */
export const triageCondition = (condition) => {
  const c = condition?.toLowerCase();

  const emergencies = [
    "chest pain",
    "stroke",
    "seizure",
    "breathing difficulty",
    "unconscious",
    "severe bleeding"
  ];

  if (emergencies.some(e => c.includes(e))) {
    return {
      urgent: true,
      message: "Emergency condition detected. Immediate medical care required."
    };
  }

  return { urgent: false };
};

