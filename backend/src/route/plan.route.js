import { Router } from "express";
import { addPlan, deletePlan, getAllPlans, updatePlan } from "../controller/plan.controller.js";
// import { authMiddleware } from "../controller/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
const planRouter = Router();
// planRouter.use(authMiddleware);
planRouter.route('/addPlan').post(addPlan)
planRouter.route('/updatePlan').patch(updatePlan)
planRouter.route('/getPlans/:adminId').get(getAllPlans)
planRouter.route('/deletePlan').delete(deletePlan)
export {planRouter}