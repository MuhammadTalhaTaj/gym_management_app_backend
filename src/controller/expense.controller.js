import { Expense } from "../model/expense.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addExpense = asyncHandler(async (req,res)=>{

    const {name, amount, date,notes}=req.body;

    const newExpense = new Expense({
        name:name,
        amount:amount,
        date:date,
        notes:notes
    })
   await newExpense.save()
   res.status(201).json({
    message: "Expense added",
    data:newExpense
   })
})
const getExpense = asyncHandler(async (req,res)=>{
    const expenseData = await Expense.find({}) 
    res.status(200).json({
        message: "Expense Data Found",
        data: expenseData
    })
})

export {addExpense, getExpense}