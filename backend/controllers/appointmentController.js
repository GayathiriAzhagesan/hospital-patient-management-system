import Appointment from "../models/Appointment.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";

// @desc    Get appointments with role-filtering
// @route   GET /api/appointments
// @access  Private
export const getAppointments = async (req, res, next) => {
  try {
    const { status, date } = req.query;
    let filter = {};

    if (status) {
      filter.status = status;
    }
    if (date) {
      filter.date = date;
    }

    // Role-based scoping
    if (req.user.role === "Patient") {
      // Find patient record for this user
      const patient = await Patient.findOne({
        $or: [{ userId: req.user._id }, { email: req.user.email }],
      });
      if (patient) {
        filter.patientId = patient._id;
      } else {
        return res.json({ success: true, count: 0, appointments: [] });
      }
    } else if (req.user.role === "Doctor") {
      // Find doctor record for this user
      const doctor = await Doctor.findOne({
        $or: [{ userId: req.user._id }, { email: req.user.email }],
      });
      if (doctor) {
        filter.doctorId = doctor._id;
      }
    }

    const appointments = await Appointment.find(filter)
      .populate("patientId", "firstName lastName email phone")
      .populate("doctorId", "name specialty department roomNumber")
      .sort({ date: -1, time: 1 });

    res.json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
export const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("patientId")
      .populate("doctorId");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found.",
      });
    }

    res.json({
      success: true,
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Book / Create new appointment
// @route   POST /api/appointments
// @access  Private (Patient, Doctor, Admin)
export const createAppointment = async (req, res, next) => {
  try {
    let { patientId, doctorId, date, time, reason } = req.body;

    // If patient is booking, use or auto-detect their patientId
    if (req.user.role === "Patient") {
      let patient = await Patient.findOne({
        $or: [{ userId: req.user._id }, { email: req.user.email }],
      });
      if (!patient) {
        const nameParts = req.user.name.split(" ");
        patient = await Patient.create({
          firstName: nameParts[0] || "Patient",
          lastName: nameParts.slice(1).join(" ") || "User",
          email: req.user.email,
          userId: req.user._id,
        });
      }
      patientId = patient._id;
    }

    if (!patientId || !doctorId || !date || !time) {
      return res.status(400).json({
        success: false,
        message: "Please provide patientId, doctorId, date, and time for the appointment.",
      });
    }

    // Resolve names for fast denormalized reads
    const patientDoc = await Patient.findById(patientId);
    const doctorDoc = await Doctor.findById(doctorId);

    if (!patientDoc) {
      return res.status(404).json({ success: false, message: "Patient not found." });
    }
    if (!doctorDoc) {
      return res.status(404).json({ success: false, message: "Doctor not found." });
    }

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      patientName: `${patientDoc.firstName} ${patientDoc.lastName}`,
      doctorName: doctorDoc.name,
      date,
      time,
      reason: reason || "General Medical Consultation",
      status: "Scheduled",
    });

    res.status(201).json({
      success: true,
      message: "Appointment scheduled successfully",
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment status and clinical notes
// @route   PUT /api/appointments/:id/status
// @access  Private (Doctor, Admin)
export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, notes, prescriptionIssued } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found.",
      });
    }

    if (status) appointment.status = status;
    if (notes !== undefined) appointment.notes = notes;
    if (prescriptionIssued !== undefined) appointment.prescriptionIssued = prescriptionIssued;

    await appointment.save();

    res.json({
      success: true,
      message: "Appointment status updated",
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel / Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private
export const deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found.",
      });
    }

    // Patients can only cancel their own appointment
    if (req.user.role === "Patient") {
      const patient = await Patient.findOne({
        $or: [{ userId: req.user._id }, { email: req.user.email }],
      });
      if (!patient || appointment.patientId.toString() !== patient._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can only cancel your own appointments.",
        });
      }
    }

    appointment.status = "Cancelled";
    await appointment.save();

    res.json({
      success: true,
      message: "Appointment cancelled successfully",
      appointment,
    });
  } catch (error) {
    next(error);
  }
};
