import mongoose from "mongoose";
import bcrypt from "bcrypt"
const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
    },
    gymName: {
        type: String,
        required: true
    },
    gymLocation: {
        type: String,
        required: true
    },
    refreshToken: {
        type: String
    }
}, { timestaps: true })
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});


userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

export const User = mongoose.model('User', userSchema)