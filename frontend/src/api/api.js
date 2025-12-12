import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error
      const message = error.response.data?.error || error.response.data?.message || 'An error occurred';
      throw new Error(message);
    } else if (error.request) {
      // Request made but no response
      throw new Error('Network error. Please check your connection.');
    } else {
      throw new Error('An unexpected error occurred');
    }
  }
);

// API functions
export const getShows = async () => {
  const response = await api.get('/shows');
  return response.data.shows;
};

export const createShow = async (showData) => {
  const response = await api.post('/admin/shows', showData);
  return response.data.show;
};

export const getSeats = async (showId) => {
  const response = await api.get(`/shows/${showId}/seats`);
  return response.data.seats;
};

export const bookSeats = async (showId, payload) => {
  const response = await api.post(`/shows/${showId}/book`, payload);
  return response.data.booking;
};

export const getBooking = async (bookingId) => {
  const response = await api.get(`/bookings/${bookingId}`);
  return response.data.booking;
};

export default api;
