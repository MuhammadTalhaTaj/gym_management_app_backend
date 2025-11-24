import { apiRequest } from "../config/api";

interface StaffSignup {
    name: string;
    email: string;
    contact: string;
    password: string;
    role: string;
    permission: string;
    userId: string;
}

export const createStaff = async (payload: StaffSignup) => {
    try {
        const data = await apiRequest({
            method: "POST",
            body: payload,
            endpoint: "/staff/signup",
        });

        return data;
    } catch (error) {
        throw error
    }
};


