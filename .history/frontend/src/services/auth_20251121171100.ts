// src/services/auth.ts
import { apiRequest } from "../config/api";

export interface LoginPayload {
  email: string;
  password: string;
  role?: string; // "Admin" | "Staff"
}

export interface LoginResult {
  accessToken: string | null;
  refreshToken?: string | null;
  user: any;
}

/**
 * Call backend login for Admin or Staff depending on role.
 * - role "Admin"  -> POST /auth/login
 * - role "Staff"  -> POST /auth/staffLogin
 *
 * NOTE: role is NOT sent in the request body (backend does not expect it).
 * Storage behavior:
 *  - if remember === true => use localStorage for tokens/user
 *  - if remember === false => use sessionStorage for tokens/user
 * Additionally, role is stored in BOTH localStorage and sessionStorage so it can be read from anywhere.
 */
export async function loginRequest(payload: LoginPayload, remember = false): Promise<LoginResult> {
  // Basic validation
  if (!payload) {
    throw new Error("Missing payload");
  }
  const { email, password, role } = payload;
  if (!email || !password) {
    throw new Error("Email and password are required");
  }
  if (!role) {
    throw new Error("Role is required");
  }

  // Determine endpoint
  let endpoint: string;
  if (role === "Admin") {
    endpoint = "/auth/login";
  } else if (role === "Staff") {
    endpoint = "/auth/staffLogin";
  } else {
    throw new Error("Invalid role. Expected 'Admin' or 'Staff'.");
  }

  // Build body WITHOUT role
  const body = {
    email,
    password
  };

  try {
    // Call API
    const data: any = await apiRequest({
      method: "POST",
      endpoint,
      body
    });

    // Try to extract common token/user shapes robustly
    const accessToken: string | null = data?.accessToken ?? data?.token ?? data?.access_token ?? null;
    const refreshToken: string | null | undefined = data?.refreshToken ?? data?.refresh_token ?? null;

    // The user object might be at data.user, data.admin, data.staff, or directly returned
    const user: any = data?.user ?? data?.admin ?? data?.staff ?? data ?? {};

    // Choose storage based on remember flag
    const storage: Storage = remember ? localStorage : sessionStorage;

    // Persist accessToken & refreshToken & user & userId into chosen storage IF present
    try {
      if (accessToken != null) {
        storage.setItem("accessToken", accessToken);
      }
      if (refreshToken != null) {
        storage.setItem("refreshToken", refreshToken);
      }
      // store user object
      try {
        storage.setItem("user", JSON.stringify(user ?? {}));
      } catch {
        // fallback: store minimal user info if stringify fails
        try {
          storage.setItem("user", "{}");
        } catch {
          // ignore
        }
      }

      // derive userId from common fields
      const userId = user?.id ?? user?._id ?? user?.userId ?? "";
      if (userId) {
        storage.setItem("userId", String(userId));
      } else {
        // remove if present previously to avoid stale ids
        storage.removeItem("userId");
      }
    } catch (e) {
      // Storage might fail in some environments (e.g. private mode). Surface a useful error.
      console.warn("Failed to write auth data to chosen storage:", e);
    }

    // Store role in BOTH storages as requested (so role can be read regardless)
    try {
      localStorage.setItem("role", role);
    } catch {
      // ignore storage error
    }
    try {
      sessionStorage.setItem("role", role);
    } catch {
      // ignore storage error
    }

    return {
      accessToken,
      refreshToken,
      user
    };
  } catch (err: any) {
    // Normalize error messages for callers
    const message = err?.message ?? String(err) ?? "Login request failed";
    throw new Error(message);
  }
}

/**
 * helper to clear auth (logout)
 */
export function clearAuth() {
  // localStorage
  try {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
  } catch { /* ignore */ }

  // sessionStorage
  try {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("role");
  } catch { /* ignore */ }
}
