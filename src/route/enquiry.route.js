import { Router } from "express";
import { addEnquiry } from "../controller/enquiry.controller.js";
const enquiryRouter = Router();
enquiryRouter.route('/addEnquiry').post(addEnquiry)
export {enquiryRouter}