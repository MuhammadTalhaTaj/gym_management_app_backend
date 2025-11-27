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

planSchema.pre("findOneAndDelete", async function (next) {
  const planId = this.getQuery()._id;

  await mongoose.model("Member").updateMany(
    { plan: planId },
    { $set: { plan: null } }
  );

  next();
});

export const Plan= mongoose.model('Plan',planSchema)