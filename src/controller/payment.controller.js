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

export { addPayment };
