import { analyzeHealthDataAI } from "./aiHealthAnalyzer";

export const analyzeReports = async (textReport, uploadedFiles) => {
  const result = await analyzeHealthDataAI(textReport, uploadedFiles);

  const formatted = [];

  result.healthIssues?.forEach(issue =>
    formatted.push({ type: "condition", ...issue })
  );

  result.allergies?.forEach(a =>
    formatted.push({ type: "allergy", ...a })
  );

  result.labResults?.forEach(l =>
    formatted.push({ type: "lab", ...l })
  );

  return formatted;
};
