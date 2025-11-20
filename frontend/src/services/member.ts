// src/services/member.ts
import { apiRequest } from "../config/api";

export interface AddMemberPayload {
  name: string;
  contact: string;
  email: string;
  gender: string;
  batch: string;
  address?: string;
  plan: string;
  joinDate: string;
  admissionAmount: number;
  discount?: number;
  collectedAmount: number;
  createdBy: string
}

export async function addMember(payload: AddMemberPayload) {
  // POST to backend member/addMember
  try {
    return apiRequest({
      method: "POST",
      endpoint: "/member/addMember",
      body: payload
    });
  } catch (error) {
    throw error
  }

}
