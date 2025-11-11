import { Router } from "express";
import { addEnquiry } from "../controller/enquiry.controller.js";
import { addExpense } from "../controller/expense.controller.js";
const enquiryRouter = Router();
enquiryRouter.route('/addEnquiry').post(addEnquiry)
enquiryRouter.route('/addExpense').post(addExpense)
export {enquiryRouter}