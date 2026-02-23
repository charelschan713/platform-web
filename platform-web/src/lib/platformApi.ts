import axios from 'axios';

const platformApi = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_PLATFORM_API_URL ??
    process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

platformApi.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

platformApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Platform API error:', error);
    return Promise.reject(error);
  },
);

export default platformApi;
