import mongoose from "mongoose";

const DoctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Doctor name is required"],
      trim: true,
    },
    specialty: {
      type: String,
      required: [true, "Medical specialty is required"],
      default: "General Medicine",
    },
    department: {
      type: String,
      default: "Outpatient Department",
    },
    phone: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      lowercase: true,
      trim: true,
    },
    shift: {
      type: String,
      enum: ["Morning", "Evening", "Night", "Rotating"],
      default: "Morning",
    },
    availableDays: {
      type: [String],
      default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    },
    consultationFee: {
      type: Number,
      default: 500,
    },
    roomNumber: {
      type: String,
      default: "Room 101",
    },
    avatar: {
      type: String,
      default: "",
    },
    qualifications: {
      type: String,
      default: "MD, MBBS",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Doctor = mongoose.models.Doctor || mongoose.model("Doctor", DoctorSchema);
export default Doctor;
