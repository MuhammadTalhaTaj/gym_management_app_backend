import { User } from "../model/user.model.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIError.js";

// Helper function to generate JWT (access token)
const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Access token expires in 1 hour
};

// Helper function to generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};

// Signup controller
const signup = asyncHandler(async (req, res) => {
  const { name, email, contact, password, gymName, gymLocation } = req.body;

  if (!name || !email || !contact || !password || !gymName || !gymLocation) {
    throw new APIError(400, "Missing required field");
  }

  // Check if email, contact, or gymName exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new APIError(400, "Email already in use");
  }

  const existingContact = await User.findOne({ contact });
  if (existingContact) {
    throw new APIError(400, "Contact already in use");
  }

  const existingGym = await User.findOne({ gymName, gymLocation });
  if (existingGym) {
    throw new APIError(400, "Gym already exists");
  }

  // Create new user
  const newUser = new User({
    name,
    email,
    contact,
    password,
    gymName,
    gymLocation,
  });

  // Save the new user
  await newUser.save();

  // Generate access and refresh tokens
  const accessToken = generateAccessToken(newUser._id);
  const refreshToken = generateRefreshToken(newUser._id);

  // Save the refresh token in the database
  newUser.refreshToken = refreshToken;
  await newUser.save();

  // Respond with the tokens and user info (without password)
  res.status(201).json({
    accessToken,
    refreshToken,
    user: {
      name: newUser.name,
      email: newUser.email,
      gymName: newUser.gymName,
      gymLocation: newUser.gymLocation,
      contact: newUser.contact,
    },
  });
});


// Login controller
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find the user by email
  const user = await User.findOne({ email });
  if (!user) {
    throw new APIError(400, "Invalid email or password");
  }

  // Check if password is correct
  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new APIError(400, "Invalid email or password");
  }

  // Generate access and refresh tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Save the refresh token in the database (in case it was changed during login)
  user.refreshToken = refreshToken;
  await user.save();

  // Respond with the tokens and user info (without password)
  res.status(200).json({
    accessToken,
    refreshToken,
    user: {
      name: user.name,
      email: user.email,
      gymName: user.gymName,
      gymLocation: user.gymLocation,
      contact: user.contact,
    },
  });
});


// Refresh Access Token Controller
const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new APIError(400, "Refresh token is required");
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Find the user who owns this refresh token
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new APIError(404, "User not found");
    }

    // Check if the refresh token stored in the database matches
    if (user.refreshToken !== refreshToken) {
      throw new APIError(403, "Invalid refresh token");
    }

    // Generate a new access token
    const newAccessToken = generateAccessToken(user._id);

    res.status(200).json({
      success: true,
      message: "Access token refreshed successfully",
      accessToken: newAccessToken,
    });
  } catch (err) {
    throw new APIError(401, "Invalid or expired refresh token");
  }
});


// Middleware to protect routes (Authorization check)
const authMiddleware = asyncHandler(async (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1]; // Extract token from Authorization header
  if (!token) {
    throw new APIError(401, "Unauthorized");
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.userId = decoded.userId; // Attach userId to the request object
  next();
});


export { signup, login, authMiddleware, refreshAccessToken };
