// src/services/auth.ts
import { apiRequest } from "../config/api";

export interface LoginPayload {
  email: string;
  password: string;
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

  // backend returns { accessToken, refreshToken, user: { ... } }
  const { accessToken, refreshToken, user } = data;

  // const storage = remember ? localStorage : sessionStorage;
  const storage = remember ? localStorage : localStorage;

  storage.setItem("accessToken", accessToken);
  storage.setItem("refreshToken", refreshToken);
  storage.setItem("user", JSON.stringify(user));
  storage.setItem("userId", user.id);
  // storage.setItem("userId", user.id);
  // storage.setItem("userId", user.id);

  // also keep a copy in the other storage if user chose localStorage to be thorough (not required)
  if (remember) {
    // optional: keep nothing in sessionStorage if remember = true
  }

  return { accessToken, refreshToken, user };
}

/**
 * helper to clear auth (logout)
 */
export function clearAuth() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("refreshToken");
  sessionStorage.removeItem("user");
  localStorage.removeItem("userId");
}
