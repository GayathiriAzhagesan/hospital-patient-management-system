import mongoose from "mongoose";

const PatientSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    dob: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "male",
    },
    phone: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
      lowercase: true,
      trim: true,
    },
    address: {
      type: String,
      default: "",
    },
    bloodGroup: {
      type: String,
      default: "O+",
    },
    allergies: {
      type: String,
      default: "None reported",
    },
    history: {
      type: String,
      default: "No significant prior surgeries or chronic conditions.",
    },
    vitals: {
      bloodPressure: { type: String, default: "120/80 mmHg" },
      heartRate: { type: String, default: "72 bpm" },
      temperature: { type: String, default: "98.6 °F" },
      oxygenLevel: { type: String, default: "99%" },
    },
    prescriptions: [
      {
        medication: String,
        dosage: String,
        frequency: String,
        prescribedBy: String,
        date: String,
        status: {
          type: String,
          enum: ["Active", "Dispensed", "Completed"],
          default: "Active",
        },
      },
    ],
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

// Virtual for full name
PatientSchema.virtual("name").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

PatientSchema.set("toJSON", { virtuals: true });
PatientSchema.set("toObject", { virtuals: true });

export const Patient = mongoose.models.Patient || mongoose.model("Patient", PatientSchema);
export default Patient;
