import { Router } from "express";
import { addMember } from "../controller/member.controller.js";
const memberRouter = Router()
memberRouter.route('/addMember').post(addMember)
export {memberRouter}