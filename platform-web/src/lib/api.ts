import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000',
  withCredentials: false,
});

// 自动注入JWT token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// 401 自动 refresh token 并重试
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config as any;

    if (err.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      if (typeof window !== 'undefined') {
        const refresh_token = localStorage.getItem('refresh_token');

        if (refresh_token) {
          try {
            const res = await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/auth/refresh`,
              { refresh_token },
            );

            const { access_token, refresh_token: new_refresh } = res.data;
            localStorage.setItem('access_token', access_token);
            localStorage.setItem('refresh_token', new_refresh);

            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            return api(originalRequest);
          } catch {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
          }
        } else {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(err);
  },
);

export default api;
