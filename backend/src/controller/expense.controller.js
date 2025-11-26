import { Admin } from "../model/admin.model.js";
import { Expense } from "../model/expense.model.js";
import { Staff } from "../model/staff.model.js";
import { APIError } from "../utils/APIError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Payment } from "../model/payment.model.js";
import moment from "moment";
const addExpense = asyncHandler(async (req,res)=>{

    const {name, amount, date,notes, category, createdBy, currentUser}=req.body;
if(!name || !amount || !date||!category || !createdBy){
  throw new APIError(400,"Missing Fields")
}

if (!mongoose.Types.ObjectId.isValid(createdBy)) {
    throw new APIError(400, "Invalid ID format");
  }
   if (!["Admin", "Staff"].includes(currentUser)) {
    throw new APIError(400, "Current user must be admin or staff.");
  }
  const existingExpense= await Expense.findOne({name: name,
    category:category,
    date:date,
    amount:amount
  })
  if(existingExpense){
    throw new APIError(409,"This expense already exists" )
  }
  let creator;
  if(currentUser=="Staff"){
    creator= await Staff.findById(createdBy)
    if(!creator){
      throw new APIError(400, "Staff not found")
    }
    if(creator.permission==="view"){
      throw new APIError(401, "You do not have permission")
    }
    const newExpense = new Expense({
        name:name,
        amount:amount,
        date:date,
        notes:notes,
        category:category,
        staffId: createdBy,
        createdBy: creator.createdBy
    })
   await newExpense.save()
   res.status(201).json({
    message: "Expense added by Staff",
    data:newExpense
   })

  }else{
    creator = await Admin.findById(createdBy)
    if(!creator){
      throw new APIError(400, "Admin not found")
    }
    const newExpense = new Expense({
        name:name,
        amount:amount,
        date:date,
        notes:notes,
        category:category,
        createdBy: createdBy
    })
   await newExpense.save()
   res.status(201).json({
    message: "Expense added by Admin",
    data:newExpense
   })

  }
    
})
const getExpense = asyncHandler(async (req,res)=>{
    const expenseData = await Expense.find({}) 
    res.status(200).json({
        message: "Expense Data Found",
        data: expenseData
    })
})
// Function to calculate total income and expenses for the given time range (week, month, or year)
const getIncomeAndExpenseData = asyncHandler(async (req, res) => {
  const { rangeType } = req.params;

  // Define date range
  let startDate, endDate;

  if (rangeType === 'week') {
    startDate = moment().startOf('week').toDate();
    endDate = moment().endOf('week').toDate();
  } else if (rangeType === 'month') {
    startDate = moment().startOf('month').toDate();
    endDate = moment().endOf('month').toDate();
  } else if (rangeType === 'year') {
    startDate = moment().startOf('year').toDate();
    endDate = moment().endOf('year').toDate();
  } else {
    throw new APIError(400, "Invalid range type");
  }

  // -------------------------
  // 📌 INCOME DOCUMENTS
  // -------------------------
  const incomeDocs = await Payment.find({
    amount: { $gt: 0 },
    paymentDate: { $gte: startDate, $lte: endDate }
  });

  const totalIncome = incomeDocs.reduce((sum, p) => sum + p.amount, 0);

  // -------------------------
  // 📌 EXPENSE DOCUMENTS
  // -------------------------
  const expenseDocs = await Expense.find({
    amount: { $lt: 0 },
    date: { $gte: startDate, $lte: endDate }
  });

  const totalExpense = expenseDocs.reduce((sum, e) => sum + e.amount, 0);

  // -------------------------
  // 📌 RESPONSE
  // -------------------------
  res.status(200).json({
    rangeType,
    startDate,
    endDate,
    totalIncome,
    totalExpense,
    incomeDocs,
    expenseDocs
  });
});


// Example usage



export {addExpense, getExpense, getIncomeAndExpenseData}