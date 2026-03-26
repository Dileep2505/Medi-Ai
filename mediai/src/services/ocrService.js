import Tesseract from 'tesseract.js';

/**
 * Extract text from image files using OCR
 */
export const extractTextFromImage = async (file) => {
  try {
    const result = await Tesseract.recognize(file, 'eng', {
      logger: () => {},
    });

    return result && result.data && result.data.text
      ? result.data.text
      : '';
  } catch (error) {
    console.error('OCR image error:', error);
    return '';
  }
};

/**
 * Extract text from PDF files
 * (Frontend PDF OCR not supported – placeholder)
 */
export const extractTextFromPDF = async () => {
  return '';
};
