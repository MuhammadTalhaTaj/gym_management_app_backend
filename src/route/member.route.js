import { Router } from "express";
import { addMember, findMember, getAllMembers } from "../controller/member.controller.js";
const memberRouter = Router()
memberRouter.route('/addMember').post(addMember)
memberRouter.route('/findMember').get(findMember)
memberRouter.route('/getAllMember').get(getAllMembers)
export {memberRouter}