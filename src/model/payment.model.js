import mongoose from "mongoose";
const paymentSchema = mongoose.Schema({
 amount:{
    type: Number,
    required:true
},
 memberId:{
    type:mongoose.Types.ObjectId,
    ref: 'member',
    required:true
 },
 plan:{
    type:mongoose.Types.ObjectId,
    ref:'Plan',
    required:true
 },
 paymentDate:{
    type:Date,
    required: true
 }
},{timestamps:true})

export const Payment= mongoose.model('Payment', paymentSchema)