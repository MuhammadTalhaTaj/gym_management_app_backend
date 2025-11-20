
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIError.js";
import jwt from "jsonwebtoken"
// -------------------- AUTH MIDDLEWARE --------------------
const authMiddleware = asyncHandler(async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) throw new APIError(401, "Unauthorized");

    const parts = authHeader.split(" ");
    if (parts.length !== 2) throw new APIError(401, "Unauthorized");

    const token = parts[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    // console.error(err)
    if (err instanceof APIError) throw err;
    throw new APIError(401, "Invalid or expired token");
  }
});

export {authMiddleware}