// routes/auth.routes.js
import { Router } from "express";
import { 
  authMiddleware, 
  dashboardController, 
  login, 
  signup,
  refreshAccessToken,
  logout 
} from "../controller/auth.controller.js";

// auth.routes.js
const userRouter = Router();

// Public routes
userRouter.route('/signup').post(signup)
userRouter.route('/login').post(login)
userRouter.route('/logout').post(logout)
userRouter.route('/refreshToken').post(refreshAccessToken)

// Protected routes (require authentication)
userRouter.get('/authenticate', authMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Authentication successful",
    userId: req.userId,
  });
});

userRouter.get('/dashboard', authMiddleware, dashboardController);

export { userRouter };