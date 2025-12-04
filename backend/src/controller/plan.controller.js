import { Plan } from "../model/plan.model.js";
import { Admin } from "../model/admin.model.js";
import { APIError } from "../utils/APIError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Staff } from "../model/staff.model.js";
import mongoose from "mongoose";
import { Member } from "../model/member.model.js";

//add plan under admin 
const addPlan = asyncHandler(async (req, res) => {
    const { name, durationType, duration, amount, createdBy, currentUser} = req.body;
    if (!name || !durationType || !duration || !amount|| !createdBy) {
        throw new APIError(400, "Provide required fields")
    }

    if (!mongoose.Types.ObjectId.isValid(createdBy)) {
    throw new APIError(400, "Invalid ID format");
  }
   if (!["Admin", "Staff"].includes(currentUser)) {
    throw new APIError(400, "Current user must be admin or staff.");
  }
    const existingPlan = await Plan.findOne({ name, durationType, duration, amount })
    if (existingPlan) {
        throw new APIError(409, "Plan already exists!")
    }
let creator;
    if(currentUser=="Staff"){
        creator= await Staff.findById(createdBy)
        if(!creator){
            throw new APIError("Staff not found")
        }
        if(creator.permission=="view"){
            throw new APIError(401,"You do not have permission to add")
        }
        const newPlan = new Plan(
        {
            name,
            durationType,
            duration,
            amount,
            createdBy: creator.createdBy
        })
    await newPlan.save()

    res.status(201).json({
        message: "New plan added successfully",
        data: newPlan
    });
    }
    else{
const admin = await Admin.exists({_id:createdBy})
    if(!admin){
        throw new APIError(404, "No admin found")
    }
    const newPlan = new Plan(
        {
            name,
            durationType,
            duration,
            amount,
            createdBy
        })
    await newPlan.save()

    res.status(201).json({
        message: "New plan added successfully",
        data: newPlan
    });
    }
    
})
// get plans by admin ID for searching
const getAllPlans = asyncHandler(async(req,res)=>{
    const{adminId}=req.params;
    const planData = await Plan.find({createdBy:adminId});
    if(!planData || planData.length == 0){
        throw new APIError(404,"No plan found")
    }
    res.status(200).json({
        message:"Plan Data Found",
        data: planData
    });
})

const deletePlan = asyncHandler(async (req, res)=>{
    const{userId,currentUser, planId, }=req.body;
    console.log(userId, currentUser, planId)
    if(!userId||!currentUser||!planId){
        throw new APIError(400,"Missing required fields")
    }
    if (!mongoose.Types.ObjectId.isValid(userId)|| !mongoose.Types.ObjectId.isValid(planId)) {
    throw new APIError(400, "Invalid ID format");
  }
   if (!["Admin", "Staff"].includes(currentUser)) {
    throw new APIError(400, "Current user must be admin or staff.");
  }
  let creator;
  if(currentUser=="Staff"){
    creator= await Staff.findById(userId)
    if(!creator){
    throw new APIError(404,"Staff not found")
  } 
  if(creator.permission!=="all"){
    throw new APIError(401,"you do not have permission to delete")
  }
  const plan= await Plan.exists({_id:planId})
  if(!plan){
    throw new APIError(404,"Plan not found")
}
await Plan.findByIdAndDelete(planId);

res.status(200).json({
    message: "Plan deleted successfully"
})
  }else{
    creator = await Admin.exists({_id:userId})
    if(!creator){
    throw new APIError(404,"Admin not found")
  } 
   const plan= await Plan.exists({_id:planId})
  if(!plan){
    throw new APIError(404,"Plan not found")
}
await Plan.findByIdAndDelete(planId);

res.status(200).json({
    message: "Plan deleted successfully"
})
  }
  
    
})
const updatePlan = asyncHandler(async (req, res) => {
  const { planId, userId, name, amount, duration, durationType } = req.body;

  if (!planId || !userId) {
    throw new APIError(400, "Missing required fields: planId or userId");
  }

  if (!mongoose.Types.ObjectId.isValid(planId) || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new APIError(400, "Invalid id format");
  }

  const plan = await Plan.findById(planId);
  if (!plan) {
    throw new APIError(404, "Plan not found");
  }

  // Authorization: must be creator
  if (plan.createdBy.toString() !== userId.toString()) {
    throw new APIError(403, "Not authorized to update this plan");
  }

  // Build partial update object
  const updates = {};
  if (typeof name === "string" && name.trim().length > 0) updates.name = name.trim();
  if (typeof amount === "number" && !Number.isNaN(amount)) updates.amount = amount;
  if (typeof duration === "number" && !Number.isNaN(duration)) updates.duration = duration;
  if (typeof durationType === "string" && durationType.trim().length > 0)
    updates.durationType = durationType.trim();

  if (Object.keys(updates).length === 0) {
    throw new APIError(400, "No valid fields provided to update");
  }

  const updated = await Plan.findByIdAndUpdate(planId, { $set: updates }, { new: true });

  res.status(200).json({
    message: "Plan updated successfully",
    data: updated,
  });
});
export {addPlan, getAllPlans, deletePlan,updatePlan}