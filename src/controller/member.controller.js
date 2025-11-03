import { Member } from "../model/member.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIError.js";

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
    member: memberWithPlan[0] // return single member document with plan details
  });
});

export { addMember };
