const AUTH_KEY = "authToken";
const LAST_ACTIVE_KEY = "lastActiveAt";

export const saveToken = (token) => localStorage.setItem(AUTH_KEY, token);
export const getToken = () => localStorage.getItem(AUTH_KEY);
export const clearToken = () => {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(LAST_ACTIVE_KEY);
};

export const touchActivity = () =>
  localStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()));

export const getLastActive = () => {
  const v = localStorage.getItem(LAST_ACTIVE_KEY);
  return v ? Number(v) : 0;
};

export const isAuthenticated = () => !!getToken();

export const isIdle = (idleMs) => {
  const last = getLastActive();
  if (!last) return false;
  return Date.now() - last >= idleMs;
};
