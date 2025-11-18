import { Router } from "express";
import { addPayment, viewPayments,getAllPayments } from "../controller/payment.controller.js";
// import { authMiddleware } from "../controller/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
const paymentRouter = Router();
paymentRouter.use(authMiddleware);
paymentRouter.route('/addPayment').post(addPayment)
paymentRouter.route('/viewPayments/:memberId').get(viewPayments)
paymentRouter.route("/getAllPayments/:adminId").get(getAllPayments)
export {paymentRouter}