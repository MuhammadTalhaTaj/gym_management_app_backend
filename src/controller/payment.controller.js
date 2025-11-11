import { Plan } from "../model/plan.model.js";
import { Member } from "../model/member.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIError.js";
import { Payment } from "../model/payment.model.js";

const addPayment = asyncHandler(async (req, res) => {
  const { amount, memberId, plan, paymentDate } = req.body;

  if (!amount || !memberId || !plan || !paymentDate) {
    throw new APIError(400, "Provide required fields");
  }

  const member = await Member.findById(memberId);
  if (!member) {
    throw new APIError(404, "Member not found");
  }

  const planDetails = await Plan.findById(plan);
  if (!planDetails) {
    throw new APIError(404, "Plan not found");
  }

  if (member.dueAmount <= 0) {
    throw new APIError(400, "The member has no outstanding balance (dueAmount must be greater than 0)");
  }

  if (amount > member.dueAmount) {
    throw new APIError(400, "Payment amount cannot be greater than the dueAmount");
  }

  if (amount <= 0) {
    throw new APIError(400, "Payment amount must be greater than 0");
  }

  const remainingDueAmount = member.dueAmount - amount;
  if (remainingDueAmount < 0) {
    throw new APIError(400, "Payment amount cannot exceed the remaining due amount");
  }

  const newPayment = new Payment({
    amount,
    memberId,
    plan,
    paymentDate
  });

  await newPayment.save();

  member.collectedAmount += amount; // Add the payment amount to the collectedAmount
  member.dueAmount = remainingDueAmount; // Update the dueAmount after the payment
  await member.save();

  res.status(201).json({
    message: "New payment added successfully",
    data: {
      member: member,  // Updated member data
      payment: newPayment  // Payment details
    }
  });
});

const viewPayments = asyncHandler(async (req, res) => {
  const { memberId } = req.params;
  if (!memberId) {
    throw new APIError(400, "Provide Id");
  }

  // Use aggregation pipeline to fetch member data and related payments
  const memberHistory = await Member.aggregate([
    // Match the memberId to ensure we are retrieving the correct member
    { $match: { _id: mongoose.Types.ObjectId(memberId) } },
    
    // Lookup to join Payments with the Member data based on memberId
    {
      $lookup: {
        from: 'payments', // The collection to join (Payment model)
        localField: '_id', // Field in Member model
        foreignField: 'memberId', // Field in Payment model that references the Member
        as: 'payments' // The alias for the array of payments in the result
      }
    },
    
    // Optionally, unwind the payments array if you want to return a single payment object for each member (remove if you want all payments in an array)
    {
      $unwind: {
        path: '$payments',
        preserveNullAndEmptyArrays: true // If there are no payments, member data will still be returned
      }
    },
    
    // Optionally, project specific fields you want to return in the result
    {
      $project: {
        name: 1,
        email: 1,
        contact: 1,
        batch: 1,
        address: 1,
        plan: 1,
        joinDate: 1,
        admissionAmount: 1,
        discount: 1,
        collectedAmount: 1,
        dueAmount: 1,
        payments: 1 // Include payments data
      }
    }
  ]);

  // Check if the member history is empty or null
  if (!memberHistory || memberHistory.length === 0) {
    throw new APIError(404, "Member not found");
  }

  res.status(200).json({
    message: "Member with payment history",
    data: memberHistory[0] // Assuming you are looking for a single member's data
  });
});



export { addPayment };
