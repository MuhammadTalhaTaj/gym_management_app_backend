// src/services/plan.ts
import { apiRequest } from "../config/api";

/**
 * Fetch plans from backend endpoint /plan/getPlans
 * The backend controller returns { message, data: planArray }
 * This function returns an array of plan objects (each expected to have _id, name, amount).
 */
export async function getPlans() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
const role = localStorage.getItem('role');
const userId = role === "Admin" ? user?.id : user?.createdBy;
  const res = await apiRequest<{ message?: string; data?: any[] } | any[]>({
    method: "GET",
    endpoint: `/plan/getPlans/${userId}`
  });

  // backend might return array directly or { data: [...] }
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.data)) return res.data;
  // fallback: empty array
  return [];
}
