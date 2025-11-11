import { Router } from "express";
import { addExpense } from "../controller/expense.controller.js";
const expenseRouter = Router();
expenseRouter.route('/addExpense').post(addExpense)
export {expenseRouter}

