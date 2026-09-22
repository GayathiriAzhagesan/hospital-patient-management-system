import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\S+@\S+\.\S+$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    role: {
      type: String,
      enum: ["Doctor", "Patient", "Pharmacist", "Admin", "doctor", "patient", "pharmacist", "admin"],
      default: "Patient",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: function () {
        const r = (this.role || "").toLowerCase();
        return r === "patient" || r === "admin" ? "approved" : "pending";
      },
    },
    approved: {
      type: Boolean,
      default: function () {
        const r = (this.role || "").toLowerCase();
        return r === "patient" || r === "admin";
      },
    },
    avatar: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "Registered Member",
    },
    department: {
      type: String,
      default: "General Medicine",
    },
    phone: {
      type: String,
      default: "",
    },
    // Clinical & Professional Credential Fields
    specialization: {
      type: String,
      default: "",
      trim: true,
    },
    qualification: {
      type: String,
      default: "",
      trim: true,
    },
    licenseNumber: {
      type: String,
      default: "",
      trim: true,
    },
    experience: {
      type: String,
      default: "",
      trim: true,
    },
    hospitalClinic: {
      type: String,
      default: "",
      trim: true,
    },
    pharmacyName: {
      type: String,
      default: "",
      trim: true,
    },
    pharmacyAddress: {
      type: String,
      default: "",
      trim: true,
    },
    rejectionReason: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next ? next() : undefined;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  if (next) next();
});

// Compare password helper
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Exclude password from serialized JSON
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
