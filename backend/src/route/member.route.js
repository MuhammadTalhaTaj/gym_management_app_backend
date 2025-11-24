import { Router } from "express";
import { addMember, deleteMember, findMember, getAllMembers, getMemberWithPaymentHistory } from "../controller/member.controller.js";
// import { authMiddleware } from "../controller/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
const memberRouter = Router()
// memberRouter.use(authMiddleware);

memberRouter.route('/addMember').post(addMember)
memberRouter.route('/findMember').get(findMember)
memberRouter.route('/getAllMembers').post(getAllMembers)
memberRouter.route('/getMemberPayments/:memberId').get(getMemberWithPaymentHistory)
memberRouter.route('/deleteMember').delete(deleteMember)
export {memberRouter}