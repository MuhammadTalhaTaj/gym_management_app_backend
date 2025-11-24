import { Router } from "express";
import { addEnquiry, getEnquiries, deleteEnquiry, updateEnquiry } from "../controller/enquiry.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
const enquiryRouter = Router();
enquiryRouter.use(authMiddleware);
enquiryRouter.route('/addEnquiry').post(addEnquiry)
enquiryRouter.route('/getEnquiries/:creatorId').get( getEnquiries)
enquiryRouter.route("/deleteEnquiry").delete(deleteEnquiry)
enquiryRouter.route("/updateEnquiry").patch(updateEnquiry)
export {enquiryRouter}