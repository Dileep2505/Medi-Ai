// ================================
// Website Configuration
// ================================
export const WEBSITE_CONFIG = {
  name: 'MediAI',
  tagline: 'Your AI Medical Assistant',
  version: '1.0.0',
};

// ================================
// API Configuration (Frontend-safe)
// ================================
export const API_CONFIG = {
  endpoint: 'http://localhost:3001/api/ai',
  maxTokens: 1000
};


// ================================
// File Upload Configuration
// ================================
export const FILE_CONFIG = {
  acceptedFormats: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'],
  maxFileSize: 10 * 1024 * 1024, // 10 MB
};

// ================================
// Theme Configuration
// ================================
export const THEME = {
  primary: '#4f46e5',   // indigo-600
  secondary: '#3b82f6', // blue-500
  success: '#22c55e',   // green-500
  warning: '#eab308',   // yellow-500
  danger: '#ef4444',    // red-500
};


