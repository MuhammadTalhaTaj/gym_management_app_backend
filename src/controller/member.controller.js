import { Member } from "../model/member.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIError.js";
import { Payment } from "../model/payment.model.js";
import { Plan } from "../model/plan.model.js";
import mongoose from "mongoose";

const addMember = asyncHandler(async (req, res) => {
  const {
    name,
    contact,
    email,
    gender,
    batch,
    address,
    plan,            // Plan ID
    joinDate,
    admissionAmount,
    discount,
    collectedAmount
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

  // ✅ Fetch the plan details using the plan ID
  const planDetails = await Plan.findById(plan);
  if (!planDetails) {
    throw new APIError(404, "Plan not found");
  }

  // ✅ Calculate the due amount dynamically
  const dueAmount = (admissionAmount + planDetails.amount) - collectedAmount - discount;

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
    dueAmount // Dynamically calculated due amount
  });

  await newMember.save();

  const payment = new Payment({
    memberId: newMember._id, // Use the newly created memberId
    plan: plan,              // Use the plan the member selected
    amount: collectedAmount,
    paymentDate: new Date()
  });

  try {
    await payment.save();
  } catch (error) {
    // Rollback member creation if payment fails (you can delete the member or mark it as incomplete)
    await newMember.delete();
    throw new APIError(500, "Payment creation failed, and member is removed");
  }

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
    message: "New Member and Payment added successfully",
    data: {
      member: memberWithPlan[0], // Return member with plan details
      payment: payment           // Return the payment details
    }
  });
});



const findMember = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) {
    throw new APIError(400, "Provide name and contact")
  }
  const member = await Member.find({ name })
  if (!member) {
    throw new APIError(404, "Member not found")
  }
  res.status(200).json({
    message: "Member Found",
    data: member
  });
});

const getAllMembers = asyncHandler(async (req, res) => {
  const members = await Member.find()
  res.status(200).json({
    message: "Members found",
    data: members
  })
})

const getMemberWithPaymentHistory = asyncHandler(async (req, res) => {
  const { memberId } = req.params; // Get memberId from the route parameters
  console.log("member id received: ", memberId)
  if (!memberId) {
    throw new APIError(400, "Provide a valid memberId");
  }

  // ✅ Check if the member exists
  const member = await Member.findById({_id: memberId});  // Use memberId directly
  if (!member) {
    throw new APIError(404, "Member not found");
  }
  console.log("received member from database: ", member)
  // ✅ Aggregation pipeline to get member with payment history
  const memberWithPayments = await Member.aggregate([
    {
      $match: { _id: member._id } // Ensure ObjectId is used in aggregation
    },
    {
      $lookup: {
        from: "payments",  // The collection to join (Payment)
        localField: "_id",  // The field from Member
        foreignField: "memberId", // The field in Payment
        as: "paymentHistory" // The field name for the joined payments
      }
    },
    {
      $project: {
        name: 1,
        contact: 1,
        email: 1,
        gender: 1,
        batch: 1,
        address: 1,
        joinDate: 1,
        paymentHistory: 1 // Keep the paymentHistory array as is
      }
    }
  ]);

  console.log("received data: ", memberWithPayments)
  // ✅ Send response
  res.status(200).json({
    message: "Member with Payment History fetched successfully",
    data: memberWithPayments[0] // Return the member data along with their payment history
  });
});


export { addMember, findMember, getAllMembers, getMemberWithPaymentHistory };
