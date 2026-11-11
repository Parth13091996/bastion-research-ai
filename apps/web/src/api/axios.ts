import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  try {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token && token !== 'undefined' && token !== 'null' && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const refreshToken =
      typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
    if (refreshToken && refreshToken !== 'undefined' && refreshToken !== 'null' && config.headers) {
      config.headers['x-refresh-token'] = refreshToken;
    }
  } catch { }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => {
    // If backend auto-refreshed tokens on this request, keep localStorage synchronized
    if (typeof window !== 'undefined') {
      const newAccessToken = response.headers?.['x-access-token'];
      const newRefreshToken = response.headers?.['x-refresh-token'];
      if (newAccessToken && newAccessToken !== 'undefined' && newAccessToken !== 'null') {
        localStorage.setItem('token', newAccessToken);
      }
      if (newRefreshToken && newRefreshToken !== 'undefined' && newRefreshToken !== 'null') {
        localStorage.setItem('refreshToken', newRefreshToken);
      }
    }
    return response;
  },
  async (error: any) => {
    const originalRequest = error?.config;

    if (!error?.response || !originalRequest) {
      return Promise.reject(error);
    }

    const status = error.response.status;
    const url = originalRequest.url || '';

    // Do not attempt refresh on auth endpoints to prevent infinite refresh loops
    const isAuthRoute =
      url.includes('/api/auth/signin') ||
      url.includes('/api/auth/refresh') ||
      url.includes('/api/auth/logout') ||
      url.includes('/api/otp/verify');

    const rawRefreshToken =
      typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
    const cleanRefreshToken =
      rawRefreshToken && rawRefreshToken !== 'undefined' && rawRefreshToken !== 'null'
        ? rawRefreshToken
        : undefined;

    const rawToken =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const hasToken =
      rawToken && rawToken !== 'undefined' && rawToken !== 'null';

    // If 401 and user has session tokens (or credentials), attempt token refresh
    if (
      status === 401 &&
      !originalRequest._retry &&
      !isAuthRoute &&
      (Boolean(cleanRefreshToken) || Boolean(hasToken) || originalRequest.withCredentials)
    ) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshUrl = `${import.meta.env.VITE_API_BASE_URL || ''}/api/auth/refresh`;
        const { data } = await axios.post(
          refreshUrl,
          { refreshToken: cleanRefreshToken },
          {
            withCredentials: true,
            headers: cleanRefreshToken
              ? { 'x-refresh-token': cleanRefreshToken }
              : undefined,
          }
        );

        const newAccessToken = data?.token;
        const newRefreshToken = data?.refreshToken;

        if (typeof window !== 'undefined') {
          if (newAccessToken) localStorage.setItem('token', newAccessToken);
          if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);
        }

        if (originalRequest.headers && newAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        processQueue(null, newAccessToken);
        return axiosInstance(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
