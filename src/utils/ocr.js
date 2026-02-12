import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import Tesseract from "tesseract.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

/* ---------- IMAGE OCR ---------- */
export const extractTextFromImage = async (file) => {
  const result = await Tesseract.recognize(file, "eng");
  return result.data.text.trim();
};

/* ---------- PDF EXTRACTION (SMART) ---------- */
export const extractTextFromPDF = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);

    // 🔥 TRY REAL TEXT EXTRACTION FIRST
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(" ");

    if (pageText.trim().length > 30) {
      fullText += " " + pageText;
      continue;
    }

    // ⚠️ FALLBACK TO OCR IF PAGE HAS NO TEXT
    const viewport = page.getViewport({ scale: 3 });
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: ctx, viewport }).promise;

    const result = await Tesseract.recognize(canvas, "eng");
    fullText += " " + result.data.text;
  }

  console.log("EXTRACTED PDF TEXT:", fullText.slice(0, 1000));

  return fullText.trim();
};
