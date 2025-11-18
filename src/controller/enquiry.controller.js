import mongoose from "mongoose";
import { Enquiry } from "../model/enquiry.model.js"
import { APIError } from "../utils/APIError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../model/user.model.js";
import { Staff } from "../model/staff.model.js";


const addEnquiry = asyncHandler(async (req, res) => {
  const { name, contact, remark = "", followUp, category, status, createdBy } = req.body;

  if (!name || !contact || !followUp || !createdBy) {
    throw new APIError(400, "Provide all required fields");
  }

  if (!mongoose.Types.ObjectId.isValid(createdBy)) {
    throw new APIError(400, "Creator id is not in valid format");
  }

  const validCategories = ["discussion", "payment", "complaint", "other"];
  if (category && !validCategories.includes(category)) {
    throw new APIError(400, "Invalid category value");
  }

  const validStatus = ["open", "closed"];
  if (status && !validStatus.includes(status)) {
    throw new APIError(400, "Invalid status value");
  }

  const creatorExists = await Promise.any([
    User.exists({ _id: createdBy }),
    Staff.exists({ _id: createdBy })
  ]).catch(() => null);

  if (!creatorExists) {
    throw new APIError(404, "No creator exists");
  }

  const duplicate = await Enquiry.exists({
    name,
    contact,
    followUp,
    category,
    status: status || "open"
  });

  if (duplicate) {
    throw new APIError(409, "Enquiry already exists");
  }

  const newEnquiry = await Enquiry.create({
    name,
    contact,
    remark,
    followUp,
    category,
    status,
    createdBy
  });

  res.status(201).json({
    message: "Enquiry added successfully",
    data: newEnquiry
  });
});


const getEnquiries = asyncHandler(async (req, res) => {
    const {creatorId} = req.params;

    if(!creatorId){
        throw new APIError(400,"Creator id is missing")
    }
    if(!mongoose.Types.ObjectId.isValid(creatorId)){
        throw new APIError(400,"Creator id is not in valid format")
    }

    const enquiries = await Enquiry.find({createdBy: creatorId})
    if(!enquiries || enquiries.length == 0){
        throw new APIError(404, "Enquiries not found")
    }

    res.status(200).json({
        message: "enquiries fetched successfully",
        enquiries
    })
});

const deleteEnquiry = asyncHandler(async (req, res) => {
    const { adminId, enquiryId } = req.body

    if (!adminId || !enquiryId) {
        throw new APIError(400, "Provide admin id and enquiry id")
    }

    if (!mongoose.Types.ObjectId.isValid(adminId) || !mongoose.Types.ObjectId.isValid(enquiryId)) {
        throw new APIError(400, "Admin or Enquiry id is not in valid format")
    }

    const admin = await User.exists({ _id: adminId })
    if (!admin) {
        throw new APIError(404, "Admin not found")
    }
    const result = await Enquiry.deleteOne({ _id: enquiryId, createdBy: adminId })

    if (result.deletedCount === 0) {
        throw new APIError(404, "Enquiry not found or not created by this admin");
    }
    res.status(200).json({
        message: "Deleted successfully"
    })
})

export { addEnquiry, getEnquiries, deleteEnquiry }