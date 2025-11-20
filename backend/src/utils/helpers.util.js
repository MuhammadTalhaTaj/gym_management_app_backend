import jwt from "jsonwebtoken"
// Helper function to generate JWT (access token)
// -------------------- Config / helpers --------------------
const generateAccessToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "6h" });

const generateRefreshToken = (userId) =>
  jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

// Cookie options for refresh token (adjust secure in prod)
const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 60 * 60 * 1000, // 1 hour
  path: "/",
};


// Basic validators (tweak to your requirements)
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTACT_RE = /^\+[1-9]\d{1,14}$/;
const PASSWORD_MIN = 8;
export {EMAIL_RE,CONTACT_RE,PASSWORD_MIN, ACCESS_COOKIE_OPTIONS, generateAccessToken, generateRefreshToken}