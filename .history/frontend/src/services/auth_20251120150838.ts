// src/services/auth.ts
import { apiRequest } from "../config/api";

export interface LoginPayload {
  email: string;
  password: string;
  role?: string; // added role
}

/**
 * Call backend /auth/login and persist tokens + user.
 * If remember === true -> localStorage, else sessionStorage.
 */
export async function loginRequest(payload: LoginPayload, remember = false) {
  const data = await apiRequest({
    method: "POST",
    endpoint: "/auth/login",
    body: payload
  });

  // backend returns { accessToken, refreshToken, user: { ... } } (common shape)
  const { accessToken, refreshToken, user } = data;

  // use localStorage when remember=true, otherwise sessionStorage
  const storage = remember ? localStorage : sessionStorage;

  storage.setItem("accessToken", accessToken);
  storage.setItem("refreshToken", refreshToken);

  // ensure user object exists
  const userObj = user || {};

  // Determine role: prefer role sent by backend (user.role or data.role), otherwise fallback to payload.role
  const roleFromServer = (userObj && (userObj.role || (data as any).role)) || payload.role || '';

  // attach role to userObj if not present
  if (roleFromServer && !userObj.role) {
    userObj.role = roleFromServer;
  }

  // persist user and ids
  storage.setItem("user", JSON.stringify(userObj));
  // always set local userId and role as well so other parts can read even if sessionStorage used.
  try {
    storage.setItem("userId", String(userObj.id ?? (userObj as any).userId ?? ''));
  } catch (e) {
    // ignore storage write errors
  }

  // persist role (in chosen storage) and also ensure it's available in localStorage as requested
  if (roleFromServer) {
    storage.setItem("role", roleFromServer);
    try {
      localStorage.setItem("role", roleFromServer); // also store in localStorage for easy access
    } catch (e) {
      // ignore
    }
  }

  // also save in localStorage if remember === true (redundant but explicit)
  if (remember) {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(userObj));
    localStorage.setItem("userId", String(userObj.id ?? ''));
  }

  return { accessToken, refreshToken, user: userObj };
}

/**
 * helper to clear auth (logout)
 */
export function clearAuth() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  localStorage.removeItem("userId");
  localStorage.removeItem("role");

  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("refreshToken");
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("userId");
  sessionStorage.removeItem("role");
}
