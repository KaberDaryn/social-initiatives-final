import { API_BASE, STORAGE_KEYS } from './config.js';

export function getToken() {
  return localStorage.getItem(STORAGE_KEYS.token);
}

export function getUser() {
  const raw = localStorage.getItem(STORAGE_KEYS.user);
  return raw ? JSON.parse(raw) : null;
}

export function setSession({ token, user }) {
  localStorage.setItem(STORAGE_KEYS.token, token);
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.token);
  localStorage.removeItem(STORAGE_KEYS.user);
}

export async function apiFetch(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include'
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message || `Request failed (${res.status})`;
    const details = data?.error?.details;
    throw new Error(details ? `${msg}: ${JSON.stringify(details)}` : msg);
  }
  return data.data;
}
