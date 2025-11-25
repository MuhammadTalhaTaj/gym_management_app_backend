import { Admin } from "../model/admin.model.js";
import { Expense } from "../model/expense.model.js";
import { Staff } from "../model/staff.model.js";
import { APIError } from "../utils/APIError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Payment } from "../model/payment.model.js";
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
  const now = new Date();
  const {rangeType}= req.params

  // Define the start and end of the range based on the requested range type (week, month, or year)
  let startDate, endDate;

  if (rangeType === 'week') {
    startDate = moment().startOf('week').toDate(); // Start of the current week
    endDate = moment().endOf('week').toDate();   // End of the current week
  } else if (rangeType === 'month') {
    startDate = moment().startOf('month').toDate(); // Start of the current month
    endDate = moment().endOf('month').toDate();    // End of the current month
  } else if (rangeType === 'year') {
    startDate = moment().startOf('year').toDate();  // Start of the current year
    endDate = moment().endOf('year').toDate();     // End of the current year
  }

  // Total Income from Payment (positive amounts)
  const totalIncomeResult = await Payment.aggregate([
    {
      $match: {
        amount: { $gt: 0 },  // Match only income (positive amount)
        paymentDate: { $gte: startDate, $lte: endDate }  // Match the date range
      }
    },
    {
      $group: {
        _id: null,
        totalIncome: { $sum: "$amount" }  // Sum the income amounts
      }
    }
  ]);

  const totalIncome = totalIncomeResult.length > 0 ? totalIncomeResult[0].totalIncome : 0;

  // Total Expenses from Expense (negative amounts)
  const totalExpenseResult = await Expense.aggregate([
    {
      $match: {
        amount: { $lt: 0 },  // Match only expenses (negative amount)
        date: { $gte: startDate, $lte: endDate }  // Match the date range
      }
    },
    {
      $group: {
        _id: null,
        totalExpense: { $sum: "$amount" }  // Sum the expense amounts
      }
    }
  ]);

  const totalExpense = totalExpenseResult.length > 0 ? totalExpenseResult[0].totalExpense : 0;

  res.status(200).json( {
    totalIncome,
    totalExpense
  });
});

// Example usage



export {addExpense, getExpense, getIncomeAndExpenseData}