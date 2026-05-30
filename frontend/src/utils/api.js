export const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:8080';
  }
  return import.meta.env.VITE_API_BASE_URL || 'https://oldschool-3.onrender.com';
};
