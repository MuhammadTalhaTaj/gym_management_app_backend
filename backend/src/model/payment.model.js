import mongoose from "mongoose";
const paymentSchema = mongoose.Schema({

   createdBy:{
      type: mongoose.Types.ObjectId,
      ref:"Admin",
   },

 amount:{
    type: Number,
    required:true
},
 memberId:{
    type:mongoose.Types.ObjectId,
    ref: 'Member',
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