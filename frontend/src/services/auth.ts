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
  if (!payload.role) {
    throw new Error("Role is required in payload");
  }
  // Determine endpoint based on role
  const endpoint = payload.role === "Admin" ? "/auth/login" : "/staff/login";

  const { role, ...payloadWithoutRole } = payload;
  // Make API request
  const data = await apiRequest({
    method: "POST",
    endpoint,
    body: payloadWithoutRole,
  });

  // Extract accessToken and user dynamically
  const accessToken = data.accessToken;
  const user = payload.role === "Admin" ? data.admin : data.staff;

  // Choose storage based on "remember"
  const storage = remember ? localStorage : sessionStorage;

  // Persist tokens and user info
  storage.setItem("accessToken", accessToken);
  storage.setItem("role", payload.role);
  storage.setItem("user", JSON.stringify(user));
  storage.setItem("userId", String(user._id ?? ""));

  // If remember is true, ensure localStorage has the same info (explicit)
  if (remember && storage !== localStorage) {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("role", payload.role);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("userId", String(user._id ?? ""));
  }

  return { accessToken, user };
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
