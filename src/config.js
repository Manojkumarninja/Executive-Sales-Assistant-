// API Configuration
// Automatically switches between development and production URLs

// Production backend URL (Render) - includes /api prefix
const PRODUCTION_API_URL = 'https://executive-sales-assistant.onrender.com/api';
const DEVELOPMENT_API_URL = 'http://localhost:5000/api';

// Determine if we're in production or development
export const API_BASE_URL = import.meta.env.PROD
  ? PRODUCTION_API_URL
  : DEVELOPMENT_API_URL;

// Helper function to build full API endpoint URLs
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

// Export for debugging
console.log(`🔧 Running in ${import.meta.env.PROD ? 'PRODUCTION' : 'DEVELOPMENT'} mode`);
console.log(`📡 API Base URL: ${API_BASE_URL}`);
