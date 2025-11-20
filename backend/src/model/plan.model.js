import mongoose from "mongoose";
const planSchema= mongoose.Schema({
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