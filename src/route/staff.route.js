import { Router } from "express";
import { staffLogin, staffLogout, staffSignup } from "../controller/staff.contoller.js";
const staffRouter = Router();
staffRouter.route('/signup').post(staffSignup)
staffRouter.route('/login').post(staffLogin)
staffRouter.route('/logout').post(staffLogout)
staffRouter.route('/signup').post(staffSignup)
export {staffRouter}