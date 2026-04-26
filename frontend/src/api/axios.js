import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// Injecter l'access token à chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Refresh automatique si 401
let refreshing = null;
api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const orig = err.config;
    if (err.response?.status === 401 && !orig._retry) {
      orig._retry = true;
      if (!refreshing) {
        refreshing = axios.post('/api/auth/refresh', {
          refreshToken: localStorage.getItem('refresh_token'),
        }).then((r) => {
          localStorage.setItem('access_token',  r.data.accessToken);
          localStorage.setItem('refresh_token', r.data.refreshToken);
          refreshing = null;
        }).catch(() => {
          localStorage.clear();
          window.location.href = '/login';
        });
      }
      await refreshing;
      orig.headers.Authorization = `Bearer ${localStorage.getItem('access_token')}`;
      return api(orig);
    }
    return Promise.reject(err);
  }
);

export default api;
