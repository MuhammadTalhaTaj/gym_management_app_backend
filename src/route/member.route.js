import { Router } from "express";
import { addMember, findMember, getAllMembers, getMemberWithPaymentHistory } from "../controller/member.controller.js";
const memberRouter = Router()
memberRouter.route('/addMember').post(addMember)
memberRouter.route('/findMember').get(findMember)
memberRouter.route('/getAllMember').get(getAllMembers)
memberRouter.route('/getMemberPayments/:memberId').get(getMemberWithPaymentHistory)
export {memberRouter}