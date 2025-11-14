import { Router } from "express";
import { addEnquiry } from "../controller/enquiry.controller.js";
import { authMiddleware } from "../controller/auth.controller.js";
const enquiryRouter = Router();
enquiryRouter.use(authMiddleware);
enquiryRouter.route('/addEnquiry').post(addEnquiry)

export {enquiryRouter}