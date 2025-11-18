import { Admin } from "../model/admin.model.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIError.js";
import { Payment } from "../model/payment.model.js";
import { Member } from "../model/member.model.js";
import { Expense } from "../model/expense.model.js";
import { EMAIL_RE, CONTACT_RE, PASSWORD_MIN, REFRESH_COOKIE_OPTIONS, generateAccessToken, generateRefreshToken } from "../utils/helpers.util.js"
// -------------------- SIGNUP --------------------
const signup = asyncHandler(async (req, res) => {
  const { name, email, contact, password, gymName, gymLocation } = req.body || {};

  // 1️⃣ Presence checks
  if (!name || !email || !contact || !password || !gymName || !gymLocation) {
    throw new APIError(400, "Missing required field");
  }

  // 2️⃣ Format checks
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
    // 3️⃣ Check for duplicate gym using case-insensitive comparison
    const existingGym = await Admin.findOne({
      gymNameLower: gymName.toLowerCase().trim(),
      gymLocationLower: gymLocation.toLowerCase().trim()
    });

    if (existingGym) {
      throw new APIError(400, "Gym already exists in this location");
    }

    // 4️⃣ Create new admin
    const admin = new Admin({
      name,
      email,
      contact,
      password,
      gymName,
      gymLocation
    });
    await admin.save();

    // 5️⃣ Generate tokens
    const accessToken = generateAccessToken(admin._id);
    const refreshToken = generateRefreshToken(admin._id);

    // Store hashed refresh token in DB
    admin.refreshToken = refreshToken;
    await admin.save();

    // 6️⃣ Send refresh token in HttpOnly cookie
    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

    // 7️⃣ Respond with admin info and access token
    res.status(201).json({
      accessToken,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        contact: admin.contact,
        gymName: admin.gymName,
        gymLocation: admin.gymLocation,
      },
    });
  } catch (err) {
    // 8️⃣ Handle duplicate key errors (for email and contact)
    if (err.code === 11000) {
      const dupKey = Object.keys(err.keyValue)[0];
      if (dupKey === "email") throw new APIError(400, "Email already in use");
      if (dupKey === "contact") throw new APIError(400, "Contact already in use");
      console.log("Duplicate key found: ", dupKey)
      throw new APIError(400, "Duplicate key error");
    }

    // 9️⃣ Handle other errors (including our custom gym duplicate error)
    if (err instanceof APIError) {
      throw err;
    }
    throw err;
  }
});

// -------------------- LOGIN --------------------
const login = asyncHandler(async (req, res) => {
  const { email: rawEmail, password } = req.body || {};
  const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";

  if (!email || !password) throw new APIError(400, "Email and password are required");

  const admin = await Admin.findOne({ email });
  if (!admin) throw new APIError(404, "Admin not found");

  const isPasswordCorrect = await admin.isPasswordCorrect(password);
  if (!isPasswordCorrect) throw new APIError(400, "Invalid email or password");

  const accessToken = generateAccessToken(admin._id);
  const rawRefreshToken = generateRefreshToken(admin._id);

  // Save refresh token (model should hash it in pre-save hook for security)
  admin.refreshToken = rawRefreshToken;
  await admin.save();

  res.cookie("refreshToken", rawRefreshToken, REFRESH_COOKIE_OPTIONS);

  res.status(200).json({
    accessToken,
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      contact: admin.contact,
      gymName: admin.gymName,
      gymLocation: admin.gymLocation,
    },
  });
});

// -------------------- REFRESH ACCESS TOKEN --------------------
const refreshAccessToken = asyncHandler(async (req, res) => {
  const rawAccessToken =
    req.cookies?.refreshToken ||
    (req.headers?.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null);

  if (!rawAccessToken) throw new APIError(400, "Refresh token is required");

  let decoded;

  decoded = jwt.verify(rawAccessToken, process.env.JWT_SECRET);

  const admin = await Admin.findById(decoded.userId);
  if (!admin) throw new APIError(404, "Admin not found");

  const newAccessToken = generateAccessToken(admin._id);
  res.status(200).json({
    success: true,
    message: "Access token refreshed successfully",
    accessToken: newAccessToken
  });
});

// -------------------- LOGOUT --------------------
const logout = asyncHandler(async (req, res) => {
  const rawRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (rawRefreshToken) {
    try {
      const decoded = jwt.verify(rawRefreshToken, process.env.REFRESH_TOKEN_SECRET);
      const admin = await Admin.findById(decoded.userId);
      if (admin) {
        admin.refreshToken = undefined;
        await admin.save();
      }
    } catch (err) {
      // ignore errors here; we still clear cookie
    }
  }

  res.clearCookie("refreshToken", { path: "/" });
  return res.status(200).json({ success: true });
});

// -------------------- DASHBOARD CONTROLLER --------------------
// Option A: member's last week before expiry (expiry between now and now+7days)
const dashboardController = asyncHandler(async (req, res) => {
  const now = new Date();
  // Use UTC date boundaries
  const nowUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds()));

  const monthStartUTC = new Date(Date.UTC(nowUTC.getUTCFullYear(), nowUTC.getUTCMonth(), 1, 0, 0, 0, 0));
  const monthEndUTC = new Date(Date.UTC(nowUTC.getUTCFullYear(), nowUTC.getUTCMonth() + 1, 0, 23, 59, 59, 999));

  // Total revenue this month
  const revenueResult = await Payment.aggregate([
    { $match: { paymentDate: { $gte: monthStartUTC, $lte: monthEndUTC } } },
    { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
  ]);
  const totalRevenueThisMonth = revenueResult[0]?.totalRevenue || 0;

  // Total admissions this month
  const totalAdmissionsThisMonth = await Member.countDocuments({
    joinDate: { $gte: monthStartUTC, $lte: monthEndUTC },
  });

  // Total due amount
  const totalDueResult = await Member.aggregate([{ $group: { _id: null, totalDueAmount: { $sum: "$dueAmount" } } }]);
  const totalDueAmount = totalDueResult[0]?.totalDueAmount || 0;

  // Subscriptions expiring in each member's last 7 days (Option A)
  const next7Days = new Date(nowUTC.getTime() + 7 * 24 * 60 * 60 * 1000);

  const expiringPipeline = [
    { $lookup: { from: "plans", localField: "plan", foreignField: "_id", as: "planInfo" } },
    { $unwind: "$planInfo" },
    { $addFields: { durationTypeNormalized: { $toLower: { $trim: { input: "$planInfo.durationType" } } } } },
    {
      $addFields: {
        expiryDate: {
          $switch: {
            branches: [
              { case: { $eq: ["$durationTypeNormalized", "month"] }, then: { $dateAdd: { startDate: "$joinDate", unit: "month", amount: "$planInfo.duration" } } },
              { case: { $eq: ["$durationTypeNormalized", "week"] }, then: { $dateAdd: { startDate: "$joinDate", unit: "week", amount: "$planInfo.duration" } } },
              { case: { $eq: ["$durationTypeNormalized", "day"] }, then: { $dateAdd: { startDate: "$joinDate", unit: "day", amount: "$planInfo.duration" } } },
            ],
            default: "$joinDate",
          },
        },
      },
    },
    { $match: { expiryDate: { $gte: nowUTC, $lte: next7Days } } },
    { $count: "expiringCount" },
  ];

  const expiringSubscriptions = await Member.aggregate(expiringPipeline);
  const expiringSubscriptionsCount = expiringSubscriptions[0]?.expiringCount || 0;

  // Total expense this month
  const expenseThisMonth = await Expense.aggregate([
    { $match: { date: { $gte: monthStartUTC, $lte: monthEndUTC } } },
    { $group: { _id: null, expenses: { $sum: "$amount" } } },
  ]);
  const totalExpenseThisMonth = expenseThisMonth[0]?.expenses || 0;

  // Expired members
  const expiredPipeline = [
    { $lookup: { from: "plans", localField: "plan", foreignField: "_id", as: "planInfo" } },
    { $unwind: "$planInfo" },
    { $addFields: { durationTypeNormalized: { $toLower: { $trim: { input: "$planInfo.durationType" } } } } },
    {
      $addFields: {
        expiryDate: {
          $switch: {
            branches: [
              { case: { $eq: ["$durationTypeNormalized", "month"] }, then: { $dateAdd: { startDate: "$joinDate", unit: "month", amount: "$planInfo.duration" } } },
              { case: { $eq: ["$durationTypeNormalized", "week"] }, then: { $dateAdd: { startDate: "$joinDate", unit: "week", amount: "$planInfo.duration" } } },
              { case: { $eq: ["$durationTypeNormalized", "day"] }, then: { $dateAdd: { startDate: "$joinDate", unit: "day", amount: "$planInfo.duration" } } },
            ],
            default: "$joinDate",
          },
        },
      },
    },
    { $match: { expiryDate: { $lt: nowUTC } } },
    {
      $project: {
        _id: 1,
        name: 1,
        plan: 1,
        joinDate: 1,
        expiryDate: 1,
        dueAmount: 1,
        collectedAmount: 1,
        planName: "$planInfo.name",
        planDurationType: "$planInfo.durationType",
        planDuration: "$planInfo.duration",
      },
    },
  ];

  const expiredMembers = await Member.aggregate(expiredPipeline);
  const expiredMembersCount = expiredMembers.length;

  res.status(200).json({
    message: "Dashboard data for this month",
    revenueThisMonth: totalRevenueThisMonth,
    totalAdmissionsThisMonth,
    expiringSubscriptions: expiringSubscriptionsCount,
    netDueAmount: totalDueAmount,
    expense: totalExpenseThisMonth,
    expiredMembers: expiredMembersCount,
    expiredMembersList: expiredMembers,
  });
});

// -------------------- Export --------------------
export { signup, login, refreshAccessToken, logout, dashboardController };