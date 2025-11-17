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

const getEnquiries = asyncHandler(async (req, res) => {

    // Extract query params
    const { search, status, page = 1, limit = 20 } = req.query;

    let query = {};

    // Search by name, email, or message
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { message: { $regex: search, $options: "i" } }
        ];
    }

    // Filter by status (optional)
    if (status) {
        query.status = status;
    }

    // Validate pagination values
    const pageNum = Number(page);
    const limitNum = Math.min(Number(limit), 100); // Maximum 100 per page

    if (isNaN(pageNum) || isNaN(limitNum)) {
        return res.status(400).json({ message: "Page and limit must be valid numbers" });
    }

    // Fetch enquiries with pagination & sorting
    const enquiries = await Enquiry.find(query)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .sort({ createdAt: -1 });

    // Count total documents for pagination
    const total = await Enquiry.countDocuments(query);

    // Response
    res.status(200).json({
        message: "Enquiry Data",
        total,
        page: pageNum,
        limit: limitNum,
        data: enquiries
    });
});


export {addEnquiry, getEnquiries}