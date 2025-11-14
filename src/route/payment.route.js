import { Router } from "express";
import { addPayment, viewPayments } from "../controller/payment.controller.js";
import { authMiddleware } from "../controller/auth.controller.js";
const paymentRouter = Router();
paymentRouter.use(authMiddleware);
paymentRouter.route('/addPayment').post(addPayment)
paymentRouter.route('/viewPayments/:memberId').get(viewPayments)
export {paymentRouter}