import axios from 'axios';
import Constants from 'expo-constants';

// Get the backend URL from environment or use the current Replit dev URL
// When testing on your phone, the API should point to your Replit URL
const getApiUrl = () => {
  if (Constants.expoConfig?.extra?.apiUrl) {
    return Constants.expoConfig.extra.apiUrl;
  }
  
  // Default to the current Replit URL
  // This will automatically work when you start the Expo server
  return 'https://cb8d11f0-9b74-4f2b-8d52-0aeb05ff3cd0-00-15weriw4t5t7e.spock.replit.dev/api';
};

export const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for session cookies
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      console.log('Unauthorized - need to login');
    }
    return Promise.reject(error);
  }
);
