// src/config/api.ts
import { readAccessToken as readStoredAccessToken, setAccessToken as storeAccessToken, refreshAccessToken, callAuthFailureHandler } from "./auth";

const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "");

export interface ApiRequestOptions {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  endpoint: string;
  body?: any;
  headers?: Record<string, string>;
  mapFn?: (data: any) => any;
  // internal flag to prevent infinite retry loops
  _retry?: boolean;
}

/**
 * Internal refresh state so multiple concurrent requests wait for a single refresh call
 */
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

/**
 * Wait helper: ensure only one refresh request runs and others wait
 */
async function ensureRefreshed(): Promise<string> {
  if (isRefreshing && refreshPromise) return refreshPromise;
  isRefreshing = true;
  refreshPromise = refreshAccessToken()
    .then((token) => {
      isRefreshing = false;
      refreshPromise = null;
      return token;
    })
    .catch((err) => {
      isRefreshing = false;
      refreshPromise = null;
      // bubble the error
      throw err;
    });
  return refreshPromise;
}

/**
 * Build fetch config from opts and token
 */
function buildFetchConfig(opts: ApiRequestOptions, accessToken?: string): RequestInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...opts.headers
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const config: RequestInit = {
    method: opts.method,
    headers,
    credentials: "include", // include cookies by default (useful for refresh cookie)
  };

  if (opts.body && ["POST", "PUT", "PATCH", "DELETE"].includes(opts.method)) {
    config.body = JSON.stringify(opts.body);
  }

  return config;
}

/**
 * Unified API request helper with automatic refresh-on-401.
 */
export async function apiRequest<T = any>(opts: ApiRequestOptions): Promise<T> {
  const url = `${BASE_URL}${opts.endpoint}`;
  const token = readStoredAccessToken();
  const config = buildFetchConfig(opts, token ?? undefined);

  const doFetch = async (): Promise<Response> => {
    return fetch(url, config);
  };

  let response = await doFetch();

  // If unauthorized (401) and we haven't retried yet -> try refresh
  if (response.status === 401 && !opts._retry) {
    try {
      // Attempt single refresh for all concurrent callers
      const newToken = await ensureRefreshed();
      // update config with new token and retry once
      opts._retry = true;
      const retryConfig = buildFetchConfig(opts, newToken);
      response = await fetch(url, retryConfig);
    } catch (err) {
      // refresh failed -> clear tokens and notify app
      storeAccessToken(null);
      callAuthFailureHandler();
      throw err;
    }
  }

  // handle 204 No Content responses
  if (response.status === 204) {
    return opts.mapFn ? opts.mapFn({ items: [], totalCount: 0 }) : ({} as T);
  }

  // parse JSON safely
  let data: any;
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    // If the server returned 401 even after refresh -> treat as auth failure
    if (response.status === 401) {
      storeAccessToken(null);
      callAuthFailureHandler();
    }
    throw {
      status: response.status,
      message: data?.message || `API error on ${opts.endpoint}`,
      data
    };
  }

  return opts.mapFn ? opts.mapFn(data) : data;
}
