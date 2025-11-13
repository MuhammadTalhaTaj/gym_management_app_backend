import { Plan } from "../model/plan.model.js";
import { User } from "../model/user.model.js";
import { APIError } from "../utils/APIError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addPlan = asyncHandler(async (req, res) => {
    const { name, durationType, duration, amount } = req.body;
    if (!name || !durationType || !duration || !amount) {
        throw new APIError(400, "Provide required fields")
    }
    const existingPlan = await Plan.findOne({ name, durationType, duration, amount })
    if (existingPlan) {
        throw new APIError(409, "Plan already exists!")
    }
    const newPlan = new Plan(
        {
            name,
            durationType,
            duration,
            amount
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