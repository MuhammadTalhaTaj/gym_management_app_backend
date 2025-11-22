import { Staff } from "../model/staff.model.js";
import { EMAIL_RE, CONTACT_RE, PASSWORD_MIN, REFRESH_COOKIE_OPTIONS, generateAccessToken, generateRefreshToken } from "../utils/helpers.util.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIError.js";
import { Admin } from "../model/admin.model.js";

import bcrypt from "bcrypt"
// -------------------- STAFF SIGNUP --------------------
const staffSignup = asyncHandler(async (req, res) => {
    const { name, email, contact, password, role, permission, userId } = req.body || {};

    // Presence checks
    if (!name || !email || !contact || !password || !role || !permission || !userId) {
        throw new APIError(400, "Missing required field");
    }

    // Format checks
    if (!EMAIL_RE.test(email)) {
        throw new APIError(400, "Invalid email format");
    }
    if (!CONTACT_RE.test(contact)) {
        throw new APIError(400, "Invalid contact format");
    }
    if (password.length < PASSWORD_MIN) {
        throw new APIError(400, `Password must be at least ${PASSWORD_MIN} characters`);
    }

    try {
        // Duplicate email
        const existingStaff = await Staff.findOne({ email });
        if (existingStaff) throw new APIError(400, "Email already exists");

        // Create staff
        const staff = new Staff({
            name,
            email,
            contact,
            password,
            role,
            permission,
            createdBy:userId
        });
        await staff.save(); // password gets hashed in pre-save hook

        // Generate tokens
        const accessToken = generateAccessToken(staff._id);
        const refreshToken = generateRefreshToken(staff._id);

        staff.refreshToken = refreshToken;
        await staff.save();

        // Store refresh token in cookie
        res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

        // Response
        res.status(201).json({
            accessToken,
            staff: {
                id: staff._id,
                name: staff.name,
                email: staff.email,
                contact: staff.contact,
                role: staff.role,
                permission: staff.permission,
                createdBy:userId
            },
        });
    } catch (err) {
        if (err.code === 11000) {
            throw new APIError(400, "Duplicate email");
        }
        throw err;
    }
});

// -------------------- STAFF LOGIN --------------------
const staffLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) throw new APIError(400, "Email and password are required");
    
    const staff = await Staff.findOne({ email: email });
    if (!staff) throw new APIError(400, "Invalid email");

    const isPasswordCorrect = await staff.isPasswordCorrect(password);
    if (!isPasswordCorrect) throw new APIError(400, "Invalid password");

    const accessToken = generateAccessToken(staff._id);
    const rawRefreshToken = generateRefreshToken(staff._id);

    // Save refresh token
    staff.refreshToken = rawRefreshToken;
    await staff.save();

    res.cookie("refreshToken", rawRefreshToken, REFRESH_COOKIE_OPTIONS);

    res.status(200).json({
        accessToken,
        staff: {
            id: staff._id,
            name: staff.name,
            email: staff.email,
            contact: staff.contact,
            role: staff.role,
            permission: staff.permission,
        },
    });
});
// -------------------- STAFF REFRESH ACCESS TOKEN --------------------
const staffRefreshAccessToken = asyncHandler(async (req, res) => {
  const rawAccessToken =
    req.cookies?.refreshToken ||
    (req.headers?.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null);

  if (!rawAccessToken) throw new APIError(400, "Refresh token is required");

  let decoded;

  decoded = jwt.verify(rawAccessToken, process.env.JWT_SECRET);

  const staff = await Staff.findById(decoded.userId);
  if (!staff) throw new APIError(404, "Admin not found");

  const newAccessToken = generateAccessToken(staff._id);
  res.status(200).json({
    success: true,
    message: "Access token refreshed successfully",
    accessToken: newAccessToken
  });
});
// -------------------- STAFF LOGOUT --------------------
const staffLogout = asyncHandler(async (req, res) => {
    const rawRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (rawRefreshToken) {
        try {
            const decoded = jwt.verify(rawRefreshToken, process.env.REFRESH_TOKEN_SECRET);
            const staff = await Staff.findById(decoded.userId);
            if (staff) {
                staff.refreshToken = undefined;
                await staff.save();
            }
        } catch (err) { }
    }

    res.clearCookie("refreshToken", { path: "/" });
    return res.status(200).json({ success: true });
});
const staffPermission = (requiredPermission) => {
    return asyncHandler(async (req, res, next) => {
        const staff = await Staff.findById(req.userId);
        if (!staff) throw new APIError(401, "Not authorized");

        if (staff.permission !== "All" && staff.permission !== requiredPermission) {
            throw new APIError(403, "Access denied");
        }

        next();
    });
};

const updateStaff = asyncHandler(async (req, res) => {
  const { name, email, contact, password, permission , staffId, userId} = req.body;

  // Presence checks
  if (!name || !email || !contact || !permission) {
    throw new APIError(400, "Missing required field");
  }

  // Format checks
  if (!EMAIL_RE.test(email)) {
    throw new APIError(400, "Invalid email format");
  }
  if (!CONTACT_RE.test(contact)) {
    throw new APIError(400, "Invalid contact number format");
  }
  if (password && password.length < PASSWORD_MIN) {
    throw new APIError(400, `Password must be at least ${PASSWORD_MIN} characters`);
  }

  // Check if staff exists
  const admin = await Admin.findById(userId);
  if (!admin) throw new APIError(404, "Admin not found");

  const staff = await Staff.findById(staffId)
  // Prevent duplicate email
  const existingEmail = await Staff.findOne({ email, _id: { $ne: staffId } });
  if (existingEmail) throw new APIError(400, "Email already in use by another staff member");
  const hashpassword = await bcrypt.hash(password, 10)
  // Update fields
  staff.name = name;
  staff.email = email.toLowerCase();
  staff.contact = contact;
  staff.permission = permission;
  staff.createdBy= userId;
  staff.password= hashpassword

  await staff.save();

  res.status(200).json({
    message: "Staff updated successfully",
    staff: {
      id: staff._id,
      name: staff.name,
      email: staff.email,
      contact: staff.contact,
      permission: staff.permission,
      role: staff.role,
      
    },
  });
});
export {staffSignup,staffLogin,staffLogout,staffRefreshAccessToken,staffPermission, updateStaff }