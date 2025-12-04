import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { sendOtp, updateAdmin, updatePassword, verifyOtp } from "../controller/admin.controller.js";
const adminRouter = Router();
// adminRouter.use(authMiddleware);
adminRouter.route('/updateAdmin').patch(updateAdmin)
adminRouter.route('/updatePassword').patch(updatePassword)
adminRouter.route('/sendOTP').post(sendOtp)
adminRouter.route('/verifyOTP').post(verifyOtp)

export {adminRouter}