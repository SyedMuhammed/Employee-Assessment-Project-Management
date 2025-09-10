import axios from 'axios';

// Centralized axios instance using environment-based API URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '',
  withCredentials: false,
});

export default api;


