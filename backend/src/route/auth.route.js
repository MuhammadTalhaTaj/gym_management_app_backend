// routes/auth.routes.js
import { Router } from "express";
import {  
  dashboardController, 
  login, 
  signup,
  refreshAccessToken,
  logout 
} from "../controller/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { staffLogin } from "../controller/staff.contoller.js";

// auth.routes.js
const userRouter = Router();

// Public routes
userRouter.route('/signup').post(signup)
userRouter.route('/login').post(login)
userRouter.route('/logout').post(logout)
userRouter.route('/refreshToken').post(refreshAccessToken)
userRouter.route('/staffLogin').post(staffLogin)

// Protected routes (require authentication)
userRouter.get('/authenticate', authMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Authentication successful",
    userId: req.userId,
  });
});

userRouter.get('/dashboard/:adminId', authMiddleware, dashboardController);

export { userRouter };