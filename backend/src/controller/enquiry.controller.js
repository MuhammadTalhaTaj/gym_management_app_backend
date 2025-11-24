import mongoose from "mongoose";
import { Enquiry } from "../model/enquiry.model.js"
import { APIError } from "../utils/APIError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Admin } from "../model/admin.model.js";
import { Staff } from "../model/staff.model.js";


const addEnquiry = asyncHandler(async (req, res) => {
    const { name, contact, remark = "", followUp, category, creatorId, currentUser } = req.body;
    console.log(req.body)
    if (!name || !contact || !followUp || !creatorId || !currentUser) {
        throw new APIError(400, "Provide all required fields");
    }

    if (!mongoose.Types.ObjectId.isValid(creatorId)) {
        throw new APIError(400, "Creator id is not in valid format");
    }

    const validCategories = ["discussion", "payment", "complaint", "other"];
    if (category && !validCategories.includes(category)) {
        throw new APIError(400, "Invalid category value");
    }

    if (!["Admin", "Staff"].includes(currentUser)) {
        throw new APIError(400, "Current user must be admin or staff.");
    }

    let creator;
    if (currentUser == "Staff") {
        creator = await Staff.findOne({ _id: creatorId })
        if (creator?.permission == "view") {
            throw new APIError(403, "User is not allowed to add enquiry.")
        }
        const duplicate = await Enquiry.exists({
            name,
            contact,
            followUp,
            category,
            status: "open"
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
            status: "open",
            createdBy: creator.createdBy,
            staffId: creatorId
        });

        res.status(201).json({
            message: "Enquiry added successfully",
            data: newEnquiry
        });

    }
    else {
        creator = await Admin.findOne({ _id: creatorId })


        if (!creator) {
            throw new APIError(404, "No Admin Found");
        }

        const duplicate = await Enquiry.exists({
            name,
            contact,
            followUp,
            category,
            status: "open"
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
            status: "open",
            createdBy: creatorId
        });

        res.status(201).json({
            message: "Enquiry added successfully",
            data: newEnquiry
        });

    }
});


const getEnquiries = asyncHandler(async (req, res) => {
    const { creatorId } = req.params;

    if (!creatorId) {
        throw new APIError(400, "Creator id is missing")
    }
    if (!mongoose.Types.ObjectId.isValid(creatorId)) {
        throw new APIError(400, "Creator id is not in valid format")
    }

    const enquiries = await Enquiry.find({ createdBy: creatorId })
    if (!enquiries || enquiries.length == 0) {
        throw new APIError(404, "Enquiries not found")
    }

    res.status(200).json({
        message: "enquiries fetched successfully",
        enquiries
    })
});

const deleteEnquiry = asyncHandler(async (req, res) => {
    const { id, enquiryId, currentUser } = req.body

    if (!id || !enquiryId || !currentUser) {
        throw new APIError(400, "Provide all fields")
    }

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(enquiryId)) {
        throw new APIError(400, "Admin or Enquiry id is not in valid format")
    }

    if (!["Admin", "Staff"].includes(currentUser)) {
        throw new APIError(400, "Current user must be admin or staff.");
    }
    let user;
    if (currentUser == "Staff") {
        user = await Staff.findOne({ _id: id })
        if (!user) {
            throw new APIError(400, "Staff not found")
        }
        if (user?.permission !== "all") {
            throw new APIError(403, "User is not allowed to delete enquiry.")
        }
        const result = await Enquiry.deleteOne({ _id: enquiryId })

        if (result.deletedCount === 0) {
            throw new APIError(404, "Enquiry not found");
        }
        res.status(200).json({
            message: "Deleted successfully"
        });
    }
    else {
        user = await Admin.findOne({ _id: id })

        if (!user) {
            throw new APIError(404, "User not found")
        }
        const result = await Enquiry.deleteOne({ _id: enquiryId })

        if (result.deletedCount === 0) {
            throw new APIError(404, "Enquiry not found");
        }
        res.status(200).json({
            message: "Deleted successfully"
        })
    }


})

const updateEnquiry = asyncHandler(async (req, res) => {
    const { userId, currentUser, enquiryId, status } = req.body

    if (!currentUser || !enquiryId || !status) {
        throw new APIError(400, "Provide all fields")
    }

    if (!mongoose.Types.ObjectId.isValid(enquiryId)) {
        throw new APIError(400, "Enquiry id is not in valid format")
    }

    if (!["Admin", "Staff"].includes(currentUser)) {
        throw new APIError(400, "Current user must be admin or staff.");
    }

    let user;
    if (currentUser == "Staff") {
        user = await Staff.findOne({ _id: userId })
        console.log("permission: ", user.permission);
        if (!user) {
            throw new APIError(400, "Staff not found")
        }
        if (user.permission !== "all" && user.permission !== "view+add+update") {
            throw new APIError(403, "User is not allowed to update enquiry.");
        }
        const updatedEnquiry = await Enquiry.findById(
            enquiryId
        );
        if (updatedEnquiry.status === "closed") {
            throw new APIError(402, "Status is closed and cannot be changed")
        }
        updatedEnquiry.status = status;
        updatedEnquiry.updatedBy = userId;
        await updatedEnquiry.save();
        res.status(200).json({
            message: "Updated successfully",
            enquiry: updatedEnquiry
        });
    }
    else {
        user = await Admin.findOne({ _id: userId })

        if (!user) {
            throw new APIError(404, "User not found")
        }

        const updatedEnquiry = await Enquiry.findByIdAndUpdate(
            enquiryId,
            { $set: { status: status } },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            message: "Updated successfully",
            enquiry: updatedEnquiry
        });
    }
})

export { addEnquiry, getEnquiries, deleteEnquiry, updateEnquiry }