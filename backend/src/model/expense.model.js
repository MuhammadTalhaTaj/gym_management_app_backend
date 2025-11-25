import mongoose from "mongoose";
const expenseSchema = mongoose.Schema({
  createdBy:{
    type:mongoose.Schema.ObjectId,
    ref:"Admin",
    required:true
  },
  staffId:{
    type:mongoose.Schema.ObjectId,
    ref:"Staff"
  },

  name: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: [
      "rent",
      "utility",
      "equipment purchase",
      "maintainance",
      "salaries",
      "training",
      "supplies",
      "insurance",
      "others"
    ],
    trim: true,
    lowercase: true,
    required: true
  },
  notes: {
    type: String,
  },
  date: {
    type: Date,
    required: true
  }

})

export const Expense = mongoose.model('Expense', expenseSchema)