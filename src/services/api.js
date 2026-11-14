import axios from 'axios';

/**
 * Axios instance for the VESTRA API.
 *  - The short-lived access token is kept in memory only (never localStorage).
 *  - The refresh token lives in an HTTP-only cookie managed by the server.
 *  - On a 401 the request is retried once after a (single-flight) refresh call.
 */
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL, withCredentials: true, timeout: 20000 });

let accessToken = null;
let onSessionExpired = () => {};
let onTokenRefreshed = () => {};
export const setAccessToken = (t) => { accessToken = t; };
export const getAccessToken = () => accessToken;
export const setAuthHandlers = ({ expired, refreshed }) => { onSessionExpired = expired || onSessionExpired; onTokenRefreshed = refreshed || onTokenRefreshed; };

// Plain client (no interceptors) so refresh calls can never recurse.
const bare = axios.create({ baseURL: API_URL, withCredentials: true, timeout: 20000 });

let refreshing = null; // the server rotates refresh tokens, so concurrent refreshes must share one request
export const refreshSession = () => {
  if (!refreshing) {
    refreshing = bare.post('/auth/refresh')
      .then((res) => { accessToken = res.data.data.accessToken; onTokenRefreshed(res.data.data); return res.data.data; })
      .finally(() => { refreshing = null; });
  }
  return refreshing;
};

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

const toError = (error) => {
  const data = error.response?.data;
  const fieldErrors = Array.isArray(data?.errors) ? data.errors : [];
  const detail = fieldErrors.length && (!data.message || /validation/i.test(data.message)) ? fieldErrors.map((e) => e.message || e.msg || e).join('. ') : '';
  let message = detail || data?.message;
  if (!message) message = error.code === 'ECONNABORTED' ? 'The request timed out. Please try again.' : error.response ? 'Something went wrong' : 'Cannot reach the server. Check your connection and try again.';
  const err = new Error(message);
  err.status = error.response?.status; err.errors = fieldErrors; err.data = data;
  return err;
};

api.interceptors.response.use((res) => res, async (error) => {
  const original = error.config;
  const url = original?.url || '';
  const isAuthCall = /\/auth\/(login|register|refresh|forgot-password|reset-password|logout)/.test(url);
  if (error.response?.status === 401 && original && !original._retried && !isAuthCall && accessToken) {
    original._retried = true;
    try {
      await refreshSession();
      original.headers.Authorization = `Bearer ${accessToken}`;
      return api(original);
    } catch {
      accessToken = null; onSessionExpired();
    }
  }
  return Promise.reject(toError(error));
});

/** Unwraps the standard { success, message, data } envelope. */
export const unwrap = (res) => res.data.data;
export const unwrapFull = (res) => res.data; // includes message + pagination
export const apiGet = (url, config) => api.get(url, config).then(unwrap);
export const apiPost = (url, body, config) => api.post(url, body, config).then(unwrap);
export const apiPut = (url, body, config) => api.put(url, body, config).then(unwrap);
export const apiPatch = (url, body, config) => api.patch(url, body, config).then(unwrap);
export const apiDelete = (url, config) => api.delete(url, config).then(unwrap);

export default api;
