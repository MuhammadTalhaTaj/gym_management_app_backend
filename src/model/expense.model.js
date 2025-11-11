import mongoose from "mongoose";
const expenseSchema = mongoose.Schema({
  name:{
    type:String,
    required: true
  },
  amount:{
    type:Number,
    required: true
  },
  notes:{
    type:String,
  },
  date:{
    type:Date,
    required: true
  }

})

export const Expense= mongoose.model('Expense',expenseSchema)