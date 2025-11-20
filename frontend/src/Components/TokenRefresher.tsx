// src/Components/TokenRefresher.tsx
import { useEffect } from "react";
import { apiRequest } from "../config/api";

/**
 * Token refresher: periodically calls /auth/refresh-token and stores new access token.
 * - Prevents overlapping calls
 * - Avoids redirect when user is already on /login or /signup
 */
export default function TokenRefresher() {
  useEffect(() => {
    const refreshInterval = Number(import.meta.env.VITE_REFRESH_TOKEN_INTERVAL) || 5 * 60 * 1000; // default 5 min
    let mounted = true;
    let inFlight = false;

    const shouldRedirectOnFailure = () => {
      const p = window.location.pathname || "/";
      // if user is on auth pages, don't redirect them (they are logging in)
      return !(p.startsWith("/login") || p.startsWith("/signup"));
    };

    const refreshToken = async () => {
      if (!mounted) return;
      if (inFlight) return;
      inFlight = true;
      try {
        const res = await apiRequest<{ accessToken?: string }>({
          method: "POST",
          endpoint: "/auth/refresh-token",
        });

        if (res && (res as any).accessToken) {
          localStorage.setItem("accessToken", (res as any).accessToken);
        }
      } catch (err) {
        // only redirect when appropriate
        try {
          localStorage.removeItem("accessToken");
          sessionStorage.removeItem("accessToken");
        } catch (e) {}
        if (mounted && shouldRedirectOnFailure()) {
          window.location.href = "/login";
        }
      } finally {
        inFlight = false;
      }
    };

    // initial attempt (optional but useful)
    refreshToken();

    const id = setInterval(() => {
      refreshToken();
    }, refreshInterval);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  return null;
}
