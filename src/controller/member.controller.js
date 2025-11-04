import { Member } from "../model/member.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIError.js";
import mongoose from "mongoose";

const addMember = asyncHandler(async (req, res) => {
  const {
    name,
    contact,
    email,
    gender,
    batch,
    address,
    plan,
    joinDate,
    admissionAmount,
    discount,
    collectedAmount,
    dueAmount
  } = req.body;

  // ✅ Validate required fields
  if (
    !name ||
    !contact ||
    !email ||
    !gender ||
    !batch ||
    !plan ||
    !joinDate ||
    !admissionAmount ||
    !collectedAmount
  ) {
    throw new APIError(400, "Provide required fields");
  }

  // ✅ Check for existing member (by contact or email)
  const existingMember = await Member.findOne({
    $or: [{ contact: contact }, { email: email }]
  });

  if (existingMember) {
    throw new APIError(400, "Email or Phone is already in use");
  }

  // ✅ Create new member
  const newMember = new Member({
    name,
    contact,
    email,
    gender,
    batch,
    address,
    plan,
    joinDate,
    admissionAmount,
    discount,
    collectedAmount,
    dueAmount
  });

  await newMember.save();

  // ✅ Use aggregation pipeline to join with plan details
  const memberWithPlan = await Member.aggregate([
    { $match: { _id: newMember._id } },
    {
      $lookup: {
        from: "plans",
        localField: "plan",
        foreignField: "_id",
        as: "plan"
      }
    },
    {
      $unwind: {
        path: "$plan",
        preserveNullAndEmptyArrays: true
      }
    }
  ]);

  // ✅ Send response
  res.status(201).json({
    message: "New Member added successfully",
    data: memberWithPlan[0] // return single member document with plan details
  });
});


const findMember = asyncHandler (async(req, res)=>{
const{name}=req.body;
if(!name ){
  throw new APIError(400,"Provide name and contact")
}
const member = await Member.find({name})
if(!member){
  throw new APIError(404,"Member not found")
}
res.status(200).json({
  message: "Member Found",
  data: member
});
});

const getAllMembers = asyncHandler(async (req, res)=>{
  const members = await Member.find()
  res.status(200).json({
    message: "Members found",
    data: members
  })
})
export { addMember, findMember, getAllMembers };
