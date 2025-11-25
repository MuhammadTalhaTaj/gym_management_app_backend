import { Plan } from "../model/plan.model.js";
import { Admin } from "../model/admin.model.js";
import { APIError } from "../utils/APIError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addPlan = asyncHandler(async (req, res) => {
    const { name, durationType, duration, amount, createdBy} = req.body;
    if (!name || !durationType || !duration || !amount|| !createdBy) {
        throw new APIError(400, "Provide required fields")
    }
    const existingPlan = await Plan.findOne({ name, durationType, duration, amount })
    if (existingPlan) {
        throw new APIError(409, "Plan already exists!")
    }
    const admin = await Admin.exists({_id:createdBy})
    if(!admin){
        throw new APIError(400, "No admin found")
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
})

const getAllPlans = asyncHandler(async(req,res)=>{
    const planData = await Plan.find();
    res.status(200).json({
        message:"Plan Data Found",
        data: planData
    })
})
export {addPlan, getAllPlans}