import axios from 'axios';

// Dynamically determine the API URL based on the environment
const getApiUrl = (): string => {
  // If explicitly set via environment variable, use it
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Server-side rendering: default to localhost
  if (typeof window === 'undefined') {
    return 'http://localhost:3001';
  }

  // Client-side: detect the environment
  const { protocol, hostname, port } = window.location;

  // Localhost development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3001';
  }

  // GitHub Codespaces or similar cloud IDE
  // Format: https://xyz-3000.app.github.dev -> https://xyz-3001.app.github.dev
  if (hostname.includes('-3000.')) {
    return `${protocol}//${hostname.replace('-3000.', '-3001.')}`;
  }

  // Production or other environments
  // Replace port 3000 with 3001
  return `${protocol}//${hostname}:3001`;
};

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { api };
export default api;
