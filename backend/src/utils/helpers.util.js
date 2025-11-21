import jwt from "jsonwebtoken"
// Helper function to generate JWT (access token)
// -------------------- Config / helpers --------------------
const generateAccessToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "6h" });

const generateRefreshToken = (userId) =>
  jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

// Cookie options for refresh token (adjust secure in prod)
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true, // prevent JS access
  secure: process.env.NODE_ENV === "production", // HTTPS only in production
  sameSite: "strict", // strict CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  path: "/", // cookie accessible on all routes
};


// Basic validators (tweak to your requirements)
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTACT_RE = /^\+[1-9]\d{1,14}$/;
const PASSWORD_MIN = 8;
export {EMAIL_RE,CONTACT_RE,PASSWORD_MIN, REFRESH_COOKIE_OPTIONS, generateAccessToken, generateRefreshToken}