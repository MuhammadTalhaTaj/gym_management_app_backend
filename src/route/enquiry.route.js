import { Router } from "express";
import { addEnquiry, getEnquiries } from "../controller/enquiry.controller.js";
// import { authMiddleware } from "../controller/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
const enquiryRouter = Router();
enquiryRouter.use(authMiddleware);
enquiryRouter.route('/addEnquiry').post(addEnquiry)
enquiryRouter.route('/getEnquiries').get(authMiddleware, getEnquiries)
export {enquiryRouter}