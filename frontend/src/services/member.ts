// src/services/member.ts
import { apiRequest } from "../config/api";

export interface AddMemberPayload {
  name: string;
  contact: string;
  email: string;
  gender: string;
  batch: string;
  address?: string;
  plan: string;         // plan id expected by backend
  joinDate: string;     // joinDate key (backend expects this name)
  admissionAmount: number;
  discount?: number;
  collectedAmount: number;
  // any additional fields if needed
}

export async function addMember(payload: AddMemberPayload) {
  // POST to backend member/addMember
  return apiRequest({
    method: "POST",
    endpoint: "/member/addMember",
    body: payload
  });
}
