import { Router } from "express";
import { addPlan, getAllPlans } from "../controller/plan.controller.js";
const planRouter = Router();
planRouter.route('/addPlan').post(addPlan)
planRouter.route('/getPlans').get(getAllPlans)
export {planRouter}