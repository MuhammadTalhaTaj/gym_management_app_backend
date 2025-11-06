import { Router } from "express";
import { authMiddleware, dashboardController, login, signup } from "../controller/auth.controller.js";
const userRouter =Router()

userRouter.route('/signup').post(signup)
userRouter.route('/login').post(login)
userRouter.route('/authenticate')
  .get(authMiddleware, (req, res) => {
    // If authMiddleware passes, send a success response
    res.status(200).json({
      success: true,
      message: "Authentication successful",
      userId: req.userId,  // You can attach any relevant user information here
    });
  });
  userRouter.route('/dashboard').get(dashboardController)
export {userRouter}