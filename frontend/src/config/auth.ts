// src/config/auth.ts
const ACCESS_TOKEN_KEY = "accessToken";

/**
 * Read access token (prefers localStorage, fallbacks to sessionStorage)
 */
export function readAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY) || sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * Store access token.
 * If `persist` true -> save to localStorage, otherwise sessionStorage.
 */
export function setAccessToken(token: string | null, persist = true) {
  if (!token) {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    return;
  }
  if (persist) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  } else {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
}

/**
 * Clear tokens
 */
export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
}

/**
 * Call refresh endpoint to obtain a fresh access token.
 * Note: This request includes credentials because your backend may store refresh token in an httpOnly cookie.
 */
let AUTH_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "");

export async function refreshAccessToken(): Promise<string> {
  const url = `${AUTH_BASE_URL}/auth/refreshToken`;

  const res = await fetch(url, {
    method: "POST",
    // include cookies to allow the server to find httpOnly refresh cookie
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    // no body needed because your server reads cookie/header
  });

  // If server returns non-JSON or non-ok, try to parse but handle gracefully
  let data: any = {};
  try {
    data = await res.json();
  } catch (e) {
    // ignore parse error
  }

  if (!res.ok) {
    // throw useful error with body message if present
    const message = data?.message || `Failed to refresh access token (status ${res.status})`;
    throw new Error(message);
  }

  if (!data?.accessToken) {
    throw new Error("Refresh succeeded but no accessToken returned");
  }

  // store returned token (persist behavior up to you; default persist)
  setAccessToken(data.accessToken, true);
  return data.accessToken;
}

/**
 * App-level callback when refresh fails (e.g., redirect to /login)
 */
let authFailureHandler: (() => void) | null = null;
export function onAuthFailure(handler: () => void) {
  authFailureHandler = handler;
}
export function callAuthFailureHandler() {
  if (typeof authFailureHandler === "function") authFailureHandler();
}
