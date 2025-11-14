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




// Function to calculate total income and expenses for the given time range (week, month, or year)
const getIncomeAndExpenseData = async (rangeType) => {
  const now = new Date();

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

  return {
    totalIncome,
    totalExpense
  };
};

// Example usage
const getDashboardData = async () => {
  // Get total income and expenses for this month
  const monthlyData = await getIncomeAndExpenseData('month');
  console.log("Monthly Data:", monthlyData);

  // Get total income and expenses for this week
  const weeklyData = await getIncomeAndExpenseData('week');
  console.log("Weekly Data:", weeklyData);

  // Get total income and expenses for this year
  const yearlyData = await getIncomeAndExpenseData('year');
  console.log("Yearly Data:", yearlyData);
};


export {addExpense, getExpense}