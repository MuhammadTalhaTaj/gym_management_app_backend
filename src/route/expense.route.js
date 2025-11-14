import { Router } from "express";
import { addExpense, getExpense } from "../controller/expense.controller.js";
import { authMiddleware } from "../controller/auth.controller.js";
const expenseRouter = Router();
expenseRouter.use(authMiddleware);
expenseRouter.route('/addExpense').post(addExpense)
expenseRouter.route('/getExpense').get(getExpense)
export {expenseRouter}

