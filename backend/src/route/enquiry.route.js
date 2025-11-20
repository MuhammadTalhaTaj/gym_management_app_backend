import { Router } from "express";
import { addEnquiry, getEnquiries, deleteEnquiry, updateEnquiry } from "../controller/enquiry.controller.js";
// import { authMiddleware } from "../controller/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
const enquiryRouter = Router();
enquiryRouter.use(authMiddleware);
enquiryRouter.route('/addEnquiry').get(authMiddleware,addEnquiry)
enquiryRouter.route('/getEnquiries/:creatorId').get(authMiddleware, getEnquiries)
enquiryRouter.route("/deleteEnquiry").delete(authMiddleware,deleteEnquiry)
enquiryRouter.route("/update").patch(authMiddleware,updateEnquiry)
export {enquiryRouter}