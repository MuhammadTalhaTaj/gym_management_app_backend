import { Router } from "express";
import { addPayment } from "../controller/payment.controller.js";
const paymentRouter = Router();
paymentRouter.route('/addPayment').post(addPayment)
export {paymentRouter}