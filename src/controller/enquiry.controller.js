import { Enquiry } from "../model/enquiry.model.js";
import { APIError } from "../utils/APIError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
const addEnquiry = asyncHandler(async(req, res)=>{
    const{name, contact,remark, followUp, category, status}= req.body;
    if (!name || !contact || !followUp){
        throw new APIError(400,"provide required fields")
    }
    const existingEnquiry = await Enquiry.findOne({name,contact,followUp, status:"open", category })
    if(existingEnquiry){
        throw new APIError(409,"Enquiry already exists")
    }
    const newEnquiry = new Enquiry({
        name,
        contact,
        remark,
        followUp,
        category,
        status
    });
   await newEnquiry.save();
   res.status(201).json({
    message:"Enquiry added successfully",
    data: newEnquiry
   })
});

export {addEnquiry}