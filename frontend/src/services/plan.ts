// src/services/plan.ts
import { apiRequest } from "../config/api";

/**
 * Fetch plans from backend endpoint /plan/getPlans
 * The backend controller returns { message, data: planArray }
 * This function returns an array of plan objects (each expected to have _id, name, amount).
 */
export async function getPlans() {
  const res = await apiRequest<{ message?: string; data?: any[] } | any[]>({
    method: "GET",
    endpoint: "/plan/getPlans"
  });

  // backend might return array directly or { data: [...] }
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.data)) return res.data;
  // fallback: empty array
  return [];
}
