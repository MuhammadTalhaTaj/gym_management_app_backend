import mongoose from "mongoose";
const planSchema= mongoose.Schema({
   createdBy:{
      type: mongoose.Types.ObjectId,
      ref: "Admin",
      required:true
   },
 name:{
    type:String,
    required: true
 },
 durationType:{
    type:String,
    required: true
 },
 duration:{
    type:Number,
    required: true
 },
 amount:{
    type:Number,
    required: true
 },
}, {timestamps:true})

export const Plan= mongoose.model('Plan',planSchema)