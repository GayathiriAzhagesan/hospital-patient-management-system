import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: [true, "Patient ID is required"],
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "Doctor ID is required"],
    },
    patientName: {
      type: String,
      default: "",
    },
    doctorName: {
      type: String,
      default: "",
    },
    date: {
      type: String,
      required: [true, "Appointment date is required"],
    },
    time: {
      type: String,
      required: [true, "Appointment time is required"],
    },
    reason: {
      type: String,
      default: "General Consultation",
    },
    status: {
      type: String,
      enum: ["Scheduled", "In-Progress", "Completed", "Cancelled"],
      default: "Scheduled",
    },
    notes: {
      type: String,
      default: "",
    },
    prescriptionIssued: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Appointment =
  mongoose.models.Appointment || mongoose.model("Appointment", AppointmentSchema);
export default Appointment;
