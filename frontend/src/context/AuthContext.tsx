// src/context/AuthContext.tsx (example)
import React, { createContext, useEffect } from "react";
import { onAuthFailure, 
  // setAccessToken as storeAccessToken,
   clearTokens } from "../config/auth";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext<any>(null);

export const AuthProvider: React.FC<{children:any}> = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    onAuthFailure(() => {
      // clear local tokens and redirect to login
      clearTokens();
      navigate("/login");
    });
  }, [navigate]);

  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
};
