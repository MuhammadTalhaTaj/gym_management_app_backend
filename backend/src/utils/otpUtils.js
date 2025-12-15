import { asyncHandler } from "./asyncHandler.js";
import { sendEmail } from "./emailUtil.js";
import { otpStore } from "../controller/admin.controller.js";
const validateOTP = asyncHandler(async(req, res) => {
    try {
        // 0. Check if body exists and is an object
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({ success: false, message: 'Request body must be provided in JSON format' });
        }

        const { email, otp } = req.body;

        // 1. Check if email and otp are provided
        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'Email and OTP are required' });
        }

        // 2. Check if OTP exists for this email
        const stored = otpStore.get(email);
        if (!stored) {
            return res.status(404).json({ success: false, message: 'No OTP found for this email. Please request a new OTP.' });
        }

        // 3. Check if OTP has expired
        if (Date.now() > stored.expiresAt) {
            otpStore.delete(email);
            return res.status(410).json({ success: false, message: 'OTP has expired. Please request a new OTP.' });
        }
        console.log("Stored Otp: ", stored.otp)
        console.log("entered Otp: ", otp)
        
        // 4. Check if OTP matches
        if (stored.otp != otp) {
            return res.status(401).json({ success: false, message: 'Invalid OTP. Please check and try again.' });
        }

        // 5. OTP is valid
        otpStore.delete(email);
        console.log(`✅ OTP validated successfully for ${email}`);

        return res.status(200).json({ success: true, message: 'OTP validated successfully' });

    } catch (error) {
        console.error('❌ Error during OTP validation:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
});

export{validateOTP}