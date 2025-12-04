import { Admin } from "../model/admin.model.js";
import { APIError } from "../utils/APIError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import bcrypt from "bcrypt"
import dns from "dns/promises"
import nodemailer from 'nodemailer'
import crypto from "crypto";

async function getTransporter() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  console.log("DEBUG SMTP CONFIG:", {
    smtpHost: smtpHost ?? "UNDEFINED",
    smtpPort,
    smtpUser: smtpUser ? "SET" : "UNSET",
    smtpPassSet: Boolean(smtpPass),
  });

  if (!smtpHost || !smtpUser || !smtpPass) {
    throw new APIError(500, "SMTP configuration missing (SMTP_HOST/SMTP_USER/SMTP_PASS)");
  }

  // optional: debug DNS resolution for the host to check if it resolves to ::1
  try {
    const lookup = await dns.lookup(smtpHost);
    console.log("DEBUG SMTP DNS lookup:", lookup); // { address: 'x.x.x.x' , family: 4 } or family:6
  } catch (e) {
    console.warn("WARNING: DNS lookup for SMTP host failed or returned nothing", e);
    // continue - not fatal, but informative
  }

  const secure = smtpPort === 465; // true for port 465 (SSL), false for 587 (STARTTLS)

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    tls: {
      // remove rejectUnauthorized false in production, keep helpful while testing
      rejectUnauthorized: true,
    },
    // increase timeout while testing if needed:
    // socketTimeout: 30_000,
    // greetingTimeout: 30_000,
  });

  // verify connection now so we can return a helpful error instead of generic ECONNREFUSED HTML
  try {
    await transporter.verify();
    console.log("SMTP transporter verified");
  } catch (err) {
    console.error("SMTP verify failed:", err && err.message ? err.message : err);
    // Re-wrap into an APIError so your express error middleware returns JSON
    throw new APIError(502, "Unable to connect to SMTP server. Check SMTP settings.");
  }

  return transporter;
}

const OTP_EXPIRE_MINUTES = Number(process.env.OTP_EXPIRE_MINUTES || 15);
const OTP_MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS || 5);

const updateAdmin = asyncHandler(async (req, res) => {
  const { Id, email, contact, gymName, gymLocation } = req.body;

  // Validate required fields
  if (!Id || !email || !contact || !gymName || !gymLocation) {
    throw new APIError(400, "Missing required fields");
  }

  // Fetch admin
  const admin = await Admin.findById(Id);
  if (!admin) {
    throw new APIError(404, "Admin not found");
  }

  // -------------------------------
  // COLLECT fields that need checking for conflict
  // -------------------------------
  const conflicts = await Admin.findOne({
    $or: [{ email }, { contact }],
    _id: { $ne: Id } // exclude current admin
  });

  if (conflicts) {
    if (conflicts.email === email) {
      throw new APIError(409, "Email already exists");
    }
    if (conflicts.contact === contact) {
      throw new APIError(409, "Contact already exists");
    }
  }

  // -------------------------------
  // UPDATE admin fields
  // -------------------------------
  admin.email = email;
  admin.contact = contact;
  admin.gymName = gymName;
  admin.gymLocation = gymLocation;

  await admin.save();

  // -------------------------------
  // RESPONSE
  // -------------------------------
  res.status(200).json({
    message: "Admin updated successfully",
    admin
  });
});

const updatePassword= asyncHandler(async(req,res)=>{
    const {Id, email, password}=req.body;
    if(!Id||!email ||!password){
        throw new APIError(400,"Missing required fields")
    }
    const admin= await Admin.findById(Id)
    if(!admin){
        throw new APIError(404,"Admin not found")
    }
    const hashpassword = await bcrypt.hash(password,10)

    admin.password=hashpassword
    await admin.save();

    console.log(hashpassword)
    res.status(200).json({
        message:"Password Updated Successfully",
        newPassword:password,
        data:admin
    })
})
const sendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new APIError(400, "Email is required");
  }

  const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
  if (!admin) {
    throw new APIError(404, "Admin not found");
  }

  if (admin.resetOtpLockedUntil && admin.resetOtpLockedUntil > new Date()) {
    throw new APIError(429, "Too many attempts. Try again later.");
  }

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const otpHash = await bcrypt.hash(otp, 10);

  admin.resetOtpHash = otpHash;
  admin.resetOtpExpiry = new Date(Date.now() + OTP_EXPIRE_MINUTES * 60 * 1000);
  admin.resetOtpAttempts = 0;
  admin.resetOtpLockedUntil = undefined;
  await admin.save();

  const mailOptions = {
    from: process.env.FROM_EMAIL || `"No Reply" <no-reply@example.com>`,
    to: admin.email,
    subject: "Your password reset code",
    text: `Your password reset code is ${otp}. It expires in ${OTP_EXPIRE_MINUTES} minutes.`,
    html: `<p>Your password reset code is <strong>${otp}</strong>.</p>
           <p>This code expires in ${OTP_EXPIRE_MINUTES} minutes.</p>`,
  };

  // Create transporter at runtime and send
  let transporter;
  try {
    transporter = await getTransporter();
  } catch (err) {
    // getTransporter throws APIError with friendly message - rethrow so middleware sends JSON
    throw err;
  }

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error("Failed to send OTP email:", err && err.message ? err.message : err);
    // Don't leak internal error — return friendly message
    throw new APIError(502, "Failed to send OTP email. Please check SMTP credentials or try again later.");
  }

  res.status(200).json({ message: "OTP sent to your email" });
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    throw new APIError(400, "Email and OTP are required");
  }

  const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
  if (!admin) {
    throw new APIError(404, "Admin not found");
  }

  if (!admin.resetOtpHash || !admin.resetOtpExpiry) {
    throw new APIError(400, "No OTP requested for this account");
  }

  if (admin.resetOtpExpiry < new Date()) {
    admin.resetOtpHash = undefined;
    admin.resetOtpExpiry = undefined;
    admin.resetOtpAttempts = 0;
    admin.resetOtpLockedUntil = undefined;
    await admin.save();
    throw new APIError(400, "OTP expired. Please request a new code.");
  }

  if (admin.resetOtpLockedUntil && admin.resetOtpLockedUntil > new Date()) {
    throw new APIError(429, "Too many failed attempts. Try again later.");
  }

  const match = await bcrypt.compare(String(otp), admin.resetOtpHash);

  if (!match) {
    admin.resetOtpAttempts = (admin.resetOtpAttempts || 0) + 1;
    if (admin.resetOtpAttempts >= OTP_MAX_ATTEMPTS) {
      admin.resetOtpLockedUntil = new Date(Date.now() + 15 * 60 * 1000);
    }
    await admin.save();
    throw new APIError(400, "Incorrect code. Please try again.");
  }

  admin.resetOtpHash = undefined;
  admin.resetOtpExpiry = undefined;
  admin.resetOtpAttempts = 0;
  admin.resetOtpLockedUntil = undefined;
  await admin.save();

  res.status(200).json({
    message: "OTP verified",
    Id: admin._id.toString(),
    email: admin.email,
  });
});

export {updateAdmin, updatePassword, sendOtp,verifyOtp}