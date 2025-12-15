import { Member } from "../model/member.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIError.js";
import { Payment } from "../model/payment.model.js";
import { Plan } from "../model/plan.model.js";
import mongoose from "mongoose";
import { Staff } from "../model/staff.model.js";
import { Admin } from "../model/admin.model.js";

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
    collectedAmount,
    createdBy,
    currentUser // i.e Staff or Admin
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
    !collectedAmount ||
    !createdBy
  ) {
    throw new APIError(400, "Provide required fields");
  }
  if (!mongoose.Types.ObjectId.isValid(createdBy)) {
    throw new APIError(400, "Id is not in valid format");
  }
  if (!["Admin", "Staff"].includes(currentUser)) {
    throw new APIError(400, "Current user must be admin or staff.");
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
  let creator;
  if (currentUser == "Staff") {
    creator = await Staff.findById(createdBy);
    if (!creator) {
      throw new APIError(400, "Staff not found")
    }
    if (creator.permission == "view") {
      throw new APIError(401, "You do not have permission to Add Member")
    }
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
      dueAmount,
      createdBy: creator.createdBy,
      createdByStaff: createdBy // Dynamically calculated due amount
    });

    await newMember.save();

    const payment = new Payment({
      memberId: newMember._id, // Use the newly created memberId
      plan: plan,              // Use the plan the member selected
      amount: collectedAmount,
      createdBy: creator.createdBy,
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


  } else {
    creator = await Admin.findById(createdBy)
    if (!creator) {
      throw new APIError(400, "Admin not found")
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
      dueAmount,
      createdBy // Dynamically calculated due amount
    });

    await newMember.save();

    const payment = new Payment({
      memberId: newMember._id, // Use the newly created memberId
      plan: plan,              // Use the plan the member selected
      amount: collectedAmount,
      paymentDate: new Date(),
      createdBy
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
  }
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
  const { adminId } = req.body;
  // console.log(adminId)
  let members;

  // members = await Member.find({createdBy:adminId})
  // Get all members created by this admin
  members = await Member.aggregate([
    {

      $match: { createdBy: mongoose.Types.ObjectId.createFromHexString(adminId) }
    },
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
    },
    {
      $sort: { createdAt: -1 }
    }
  ]);

  if ( !members || members.length == 0) {
    throw new APIError(404, "No members")
  }


  res.status(200).json({
    data: members,
    count: members.length
  });
});
const getMemberWithPaymentHistory = asyncHandler(async (req, res) => {
  const { memberId } = req.params; // Get memberId from the route parameters
  console.log("member id received: ", memberId)
  if (!memberId) {
    throw new APIError(400, "Provide a valid memberId");
  }

  // ✅ Check if the member exists
  const member = await Member.findById({ _id: memberId });  // Use memberId directly
  if (!member) {
    throw new APIError(404, "Member not found");
  }
  console.log("received member from database: ", member)
  const planInfo = await Plan.findById(member.plan)

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
    data: memberWithPayments[0],
    plan: planInfo // Return the member data along with their payment history
  });
});


const deleteMember = asyncHandler(async (req, res) => {
  console.log("Request body: ", req.body)
  const { memberId, userId, currentUser } = req.body;

  // Validate memberId
  if (!memberId || !userId) {
    throw new APIError(400, "Member ID is required");
  }
  if (!mongoose.Types.ObjectId.isValid(memberId) || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new APIError(400, "Invalid ID format");
  }
  if (!["Admin", "Staff"].includes(currentUser)) {
    throw new APIError(400, "Current user must be admin or staff.");
  }
  let creator;
  if (currentUser == "Staff") {
    creator = await Staff.findById(userId)
    if (!creator) {
      throw new APIError(400, "Staff not found")
    }
    if (creator.permission !== "all") {
      throw new APIError(401, "You do not have permission to delete Member")
    }
    // Find the member and verify it belongs to the current admin

    const member = await Member.findOne({
      _id: memberId,
      createdBy: creator.createdBy
    });

    if (!member) {
      throw new APIError(404, "Member not found or you don't have permission to delete this member");
    }

    // Delete associated payments first (to maintain data integrity)
    await Payment.deleteMany({ memberId: memberId });

    // Delete the member
    await Member.findByIdAndDelete(memberId);

    res.status(200).json({
      success: true,
      message: "Member and associated payments deleted successfully",
      data: {
        deletedMemberId: memberId,
        deletedMemberName: member.name
      }
    });
  } else {
    creator = await Admin.findById(userId)
    if (!creator) {
      throw new APIError(400, "Admin not found")
    }
    const member = await Member.findOne({
      _id: memberId,
      createdBy: userId
    });

    if (!member) {
      throw new APIError(404, "Member not found or you don't have permission to delete this member");
    }

    // Delete associated payments first (to maintain data integrity)
    await Payment.deleteMany({ memberId: memberId });

    // Delete the member
    await Member.findByIdAndDelete(memberId);

    res.status(200).json({
      success: true,
      message: "Member and associated payments deleted successfully",
      data: {
        deletedMemberId: memberId,
        deletedMemberName: member.name
      }
    });

  }
});

const updateMembership = asyncHandler(async (req, res) => {
  const { memberId, planId, batch, collectedAmount, joiningDate, userId, currentUser } = req.body;
  if (!memberId || !planId || !collectedAmount || !joiningDate || !userId || !batch) {
    throw new APIError(400, "Missing required fields")
  }
  if (!mongoose.Types.ObjectId.isValid(memberId) || !mongoose.Types.ObjectId.isValid(planId) || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new APIError(400, "Ptovide correct Id for member, plan, admin/staff");
  }
  if (!["Admin", "Staff"].includes(currentUser)) {
    throw new APIError(400, "Current user must be admin or staff.");
  }
  let creator;
  if(currentUser=="Staff"){
    creator =await Staff.findById(userId)
    if(!creator){
      throw new APIError(404, "Staff not found")
    }
    if(creator.permission!="all" || creator.permission!="create+view+update"){
      throw new APIError(401,"You do not have access to renew Membership")
    }

const member = await Member.findById(memberId)
if(!member){
  throw new APIError(400, "Member not found")
}

const plan = await Plan.findById(planId)

if(!plan){
  throw new APIError(400, "No plan found")
}
let dueAmount= member.dueAmount+plan.amount-collectedAmount;
console.log("due amount: ", dueAmount)
member.plan= planId,
member.collectedAmount+=collectedAmount
member.dueAmount=dueAmount;
member.joiningDate=joiningDate;
member.createdByStaff=userId;
member.batch=batch

await member.save();
const payment = new Payment({
      memberId: member._id, // Use the newly created memberId
      plan: planId,              // Use the plan the member selected
      amount: collectedAmount,
      createdBy: creator.createdBy,
      paymentDate: new Date()
    });

    try {
      await payment.save();
    } catch (error) {
     throw new APIError(500, "Payment creation failed, and member is removed");
    }
res.status(200).json({
  message:"Member update Successfully",
  data:{member,
    payment
  }
})
  }else{
    creator =await Admin.findById(userId)
    if(!creator){
      throw new APIError(404, "Admin not found")
    }
    
const member = await Member.findById(memberId)
if(!member){
  throw new APIError(400, "Member not found")
}

const plan = await Plan.findById(planId)

if(!plan){
  throw new APIError(400, "No plan found")
}
let dueAmount= member.dueAmount+plan.amount-collectedAmount;
member.plan= planId,
member.collectedAmount+=collectedAmount
member.dueAmount=dueAmount;
member.joiningDate=joiningDate
member.createdBy=userId
member.batch=batch

await member.save();
const payment = new Payment({
      memberId: member._id, // Use the newly created memberId
      plan: planId,              // Use the plan the member selected
      amount: collectedAmount,
      createdBy: userId,
      paymentDate: new Date()
    });

    try {
      await payment.save();
    } catch (error) {
     throw new APIError(500, "Payment creation failed, and member is removed");
    }
res.status(200).json({
  message:"Membership renewed Successfully",
  data:{member,payment}

})

  }


});
export { addMember, findMember, getAllMembers, getMemberWithPaymentHistory, deleteMember, updateMembership };
