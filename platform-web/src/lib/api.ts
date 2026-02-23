import axios from 'axios';

const api_base_url =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://chauffeur-saas-production.up.railway.app';

const api = axios.create({
  baseURL: api_base_url,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original?._retry) {
      original._retry = true;
      try {
        const refresh_token =
          typeof window !== 'undefined'
            ? localStorage.getItem('refresh_token')
            : null;

        const { data } = await axios.post(`${api_base_url}/auth/refresh`, {
          refresh_token,
        });

        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('refresh_token', data.refresh_token);
        }

        original.headers.Authorization = `Bearer ${data.access_token}`;
        return api(original);
      } catch {
        if (typeof window !== 'undefined') {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  },
);

export default api;
