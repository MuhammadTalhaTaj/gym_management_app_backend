import { Router } from "express";
import { addPlan } from "../controller/plan.controller.js";
const planRouter = Router();
planRouter.route('/addPlan').post(addPlan)
export {planRouter}