// models/user.model.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const adminSchema = new mongoose.Schema(
    {
        name:
        {
            type: String,
            required: true,
            trim: true

        },
        email: 
        { 
            type: String, 
            required: true, 
            trim: true, 
            lowercase: true, 
            unique: true, 
            index: true 
        },
        contact: { type: String, required: true, trim: true, unique: true, index: true },
        password: { type: String, required: true, minlength: 8 },
        gymName: { type: String, required: true, trim: true },
        gymLocation: { type: String, required: true, trim: true },
        // normalized fields for case-insensitive comparison (no unique index)
        gymNameLower: { type: String },
        gymLocationLower: { type: String },
        refreshToken: { type: String }, // hashed refresh token
    },
    {
        timestamps: true,
        toJSON: {
            transform(doc, ret) {
                delete ret.password;
                delete ret.refreshToken;
                delete ret.__v;
                delete ret.gymNameLower;
                delete ret.gymLocationLower;
            },
        },
    }
);


// instance method to compare password
adminSchema.methods.isPasswordCorrect = async function (plain) {
    return bcrypt.compare(plain, this.password);
};

// instance method to compare refresh token (plain vs hashed)
adminSchema.methods.isRefreshTokenValid = async function (plainRefreshToken) {
    if (!this.refreshToken) return false;
    return bcrypt.compare(plainRefreshToken, this.refreshToken);
};

export const Admin = mongoose.model("Admin", adminSchema);