import { Router } from "express";
import { addExpense, getExpense } from "../controller/expense.controller.js";
const expenseRouter = Router();
expenseRouter.route('/addExpense').post(addExpense)
expenseRouter.route('/getExpense').get(getExpense)
export {expenseRouter}

