import mongoose from "mongoose";
import bcrypt from "bcrypt";

const staffSchema = new mongoose.Schema(
  {
    createdBy:{
        type:mongoose.Types.ObjectId,
        ref: 'User',
        required:true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    contact: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email"]
    },
    password: {
      type: String,
      required: true,
      minlength: 8
    },
    role: {
      type: String,
      required: true
    },
    permission: {
      type: String,
      enum: ["all", "view", "view+add", "view+add+update"],
      required: true
    },
    refreshToken: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

// ---------- PRE SAVE ----------
staffSchema.pre("save", async function (next) {
  // Sanitize email
  if (this.isModified("email") && typeof this.email === "string") {
    this.email = this.email.trim().toLowerCase();
  }

  // Sanitize contact
  if (this.isModified("contact") && typeof this.contact === "string") {
    this.contact = this.contact.trim();
  }

  // Hash password
  if (this.isModified("password")) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }

  // Hash refresh token
  if (this.isModified("refreshToken") && this.refreshToken) {
    const saltRounds = 10;
    this.refreshToken = await bcrypt.hash(this.refreshToken, saltRounds);
  }

  next();
});

// ---------- METHODS ----------
staffSchema.methods.isPasswordCorrect = function (plain) {
  return bcrypt.compare(plain, this.password);
};

staffSchema.methods.isRefreshTokenValid = function (plainRefreshToken) {
  if (!this.refreshToken) return false;
  return bcrypt.compare(plainRefreshToken, this.refreshToken);
};

// ---------- MODEL ----------
export const Staff = mongoose.model("Staff", staffSchema);
