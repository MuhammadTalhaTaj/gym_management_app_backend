// models/user.model.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
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

// REMOVED: compound unique index for gymNameLower + gymLocationLower

// pre-save: normalize fields and hash password / refreshToken
userSchema.pre("save", async function (next) {
    // normalize stored fields
    if (this.isModified("email") && typeof this.email === "string") {
        this.email = this.email.trim().toLowerCase();
    }
    if (this.isModified("gymName") && typeof this.gymName === "string") {
        this.gymName = this.gymName.trim();
        this.gymNameLower = this.gymName.toLowerCase();
    }
    if (this.isModified("gymLocation") && typeof this.gymLocation === "string") {
        this.gymLocation = this.gymLocation.trim();
        this.gymLocationLower = this.gymLocation.toLowerCase();
    }
    if (this.isModified("contact") && typeof this.contact === "string") {
        this.contact = this.contact.trim();
    }

    // hash password
    if (this.isModified("password")) {
        const saltRounds = 10;
        this.password = await bcrypt.hash(this.password, saltRounds);
    }

    // hash refreshToken if changed (store hashed refresh token)
    if (this.isModified("refreshToken") && this.refreshToken) {
        const saltRounds = 10;
        this.refreshToken = await bcrypt.hash(this.refreshToken, saltRounds);
    }

    next();
});

// instance method to compare password
userSchema.methods.isPasswordCorrect = async function (plain) {
    return bcrypt.compare(plain, this.password);
};

// instance method to compare refresh token (plain vs hashed)
userSchema.methods.isRefreshTokenValid = async function (plainRefreshToken) {
    if (!this.refreshToken) return false;
    return bcrypt.compare(plainRefreshToken, this.refreshToken);
};

export const User = mongoose.model("User", userSchema);