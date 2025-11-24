import { Router } from "express";
import { staffLogin, staffLogout, staffSignup, updateStaff } from "../controller/staff.contoller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const staffRouter = Router();
staffRouter.use(authMiddleware)
staffRouter.route('/logout').post(staffLogout)
staffRouter.route('/signup').post(staffSignup)
staffRouter.route('/updateStaff').patch(updateStaff)
export {staffRouter}