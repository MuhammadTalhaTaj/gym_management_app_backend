import { Admin } from "../model/admin.model.js";
import { APIError } from "../utils/APIError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import bcrypt from "bcrypt"
const updateAdmin = asyncHandler(async (req, res) => {
  const { Id, email, contact, gymName, gymLocation } = req.body;

  // Validate required fields
  if (!Id || !email || !contact || !gymName || !gymLocation) {
    throw new APIError(400, "Missing required fields");
  }

  // Fetch admin
  const admin = await Admin.findById(Id);
  if (!admin) {
    throw new APIError(404, "Admin not found");
  }

  // -------------------------------
  // COLLECT fields that need checking for conflict
  // -------------------------------
  const conflicts = await Admin.findOne({
    $or: [{ email }, { contact }],
    _id: { $ne: Id } // exclude current admin
  });

  if (conflicts) {
    if (conflicts.email === email) {
      throw new APIError(409, "Email already exists");
    }
    if (conflicts.contact === contact) {
      throw new APIError(409, "Contact already exists");
    }
  }

  // -------------------------------
  // UPDATE admin fields
  // -------------------------------
  admin.email = email;
  admin.contact = contact;
  admin.gymName = gymName;
  admin.gymLocation = gymLocation;

  await admin.save();

  // -------------------------------
  // RESPONSE
  // -------------------------------
  res.status(200).json({
    message: "Admin updated successfully",
    admin
  });
});

const updatePassword= asyncHandler(async(req,res)=>{
    const {Id, email, password}=req.body;
    if(!Id||!email ||!password){
        throw new APIError(400,"Missing required fields")
    }
    const admin= await Admin.findById(Id)
    if(!admin){
        throw new APIError(404,"Admin not found")
    }
    const hashpassword = await bcrypt.hash(password,10)

    admin.password=hashpassword
    await admin.save();

    console.log(hashpassword)
    res.status(200).json({
        message:"Password Updated Successfully",
        newPassword:password,
        data:admin
    })
})
export {updateAdmin, updatePassword}