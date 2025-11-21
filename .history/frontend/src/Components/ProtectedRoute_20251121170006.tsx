import React, { useEffect, useState } from "react";
// import { Navigate } from "react-router-dom";
import { apiRequest } from "../config/api";

type Props = {
  children: React.ReactNode;
};

const getStoredToken = (): string | null => {
  return localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
};

export default function ProtectedRoute({ children }: Props) {
  const [status, setStatus] = useState<"pending" | "ok" | "unauth">("pending");

  useEffect(() => {
    let mounted = true;

    const token = getStoredToken();
    if (!token) {
      // no token -> immediately unauth
      if (mounted) setStatus("unauth");
      return;
    }

    const validate = async () => {
      try {
        // call backend authenticate endpoint
        const res = await apiRequest<{ success?: boolean; message?: string; userId?: string }>({
          method: "GET",
          endpoint: "/auth/authenticate"
        });

        // backend returns success:true on valid token
        if (mounted && res && (res as any).success === true) {
          setStatus("ok");
        } else {
          // treat missing success flag as unauth
          if (mounted) setStatus("unauth");
        }
      } catch (err) {
        // any error -> unauth
        if (mounted) setStatus("unauth");
      }
    };

    validate();

    return () => { mounted = false; };
  }, []);

  if (status === "pending") {
    // while checking, render nothing (keep UI/layout unchanged)
    return null;
  }

  if (status === "unauth") {
    // clear tokens to ensure clean state, then redirect
    try {
      localStorage.removeItem("accessToken");
      sessionStorage.removeItem("accessToken");
    } catch (e) {
      // ignore
    }
    return <Navigate to="/login" replace />;
  }

  // auth ok
  return <>{children}</>;
}
