import { Router } from "express";
import { addExpense, getExpense, getIncomeAndExpenseData } from "../controller/expense.controller.js";
// import { authMiddleware } from "../controller/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
const expenseRouter = Router();
// expenseRouter.use(authMiddleware);
expenseRouter.route('/addExpense').post(addExpense)
expenseRouter.route('/getExpense').get(getExpense)
expenseRouter.route('/finance/:rangeType').get(getIncomeAndExpenseData)
export {expenseRouter}