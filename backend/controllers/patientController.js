import Patient from "../models/Patient.js";

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private (Doctor, Pharmacist, Admin)
export const getPatients = async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query = {
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex },
          { phone: searchRegex },
          { bloodGroup: searchRegex },
        ],
      };
    }

    const patients = await Patient.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: patients.length,
      patients,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get patient profile for currently logged in patient
// @route   GET /api/patients/me
// @access  Private (Patient)
export const getMyPatientProfile = async (req, res, next) => {
  try {
    let patient = await Patient.findOne({ userId: req.user._id });

    // Fallback: match by email if not linked by userId
    if (!patient && req.user.email) {
      patient = await Patient.findOne({ email: req.user.email });
      if (patient && !patient.userId) {
        patient.userId = req.user._id;
        await patient.save();
      }
    }

    // If still no patient record exists for this patient user, initialize one automatically
    if (!patient) {
      const nameParts = req.user.name.split(" ");
      patient = await Patient.create({
        firstName: nameParts[0] || "Patient",
        lastName: nameParts.slice(1).join(" ") || "User",
        email: req.user.email,
        phone: req.user.phone || "555-0100",
        userId: req.user._id,
      });
    }

    res.json({
      success: true,
      patient,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single patient by ID
// @route   GET /api/patients/:id
// @access  Private
export const getPatientById = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found.",
      });
    }

    res.json({
      success: true,
      patient,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new patient record
// @route   POST /api/patients
// @access  Private (Doctor, Admin)
export const createPatient = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      dob,
      gender,
      phone,
      email,
      address,
      bloodGroup,
      allergies,
      history,
      vitals,
    } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: "First name and last name are required.",
      });
    }

    const patient = await Patient.create({
      firstName,
      lastName,
      dob,
      gender,
      phone,
      email,
      address,
      bloodGroup: bloodGroup || "O+",
      allergies: allergies || "None reported",
      history: history || "No prior history.",
      vitals: vitals || {},
    });

    res.status(201).json({
      success: true,
      message: "Patient registered successfully",
      patient,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update patient details
// @route   PUT /api/patients/:id
// @access  Private (Doctor, Admin)
export const updatePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found.",
      });
    }

    res.json({
      success: true,
      message: "Patient details updated successfully",
      patient,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete patient record
// @route   DELETE /api/patients/:id
// @access  Private (Admin)
export const deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found.",
      });
    }

    res.json({
      success: true,
      message: "Patient record deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add prescription to patient
// @route   POST /api/patients/:id/prescriptions
// @access  Private (Doctor)
export const addPrescription = async (req, res, next) => {
  try {
    const { medication, dosage, frequency } = req.body;
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found.",
      });
    }

    const prescription = {
      medication,
      dosage,
      frequency,
      prescribedBy: req.user.name,
      date: new Date().toISOString().slice(0, 10),
      status: "Active",
    };

    patient.prescriptions.push(prescription);
    await patient.save();

    res.status(201).json({
      success: true,
      message: "Prescription added successfully",
      patient,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update prescription status (dispense)
// @route   PATCH /api/patients/:id/prescriptions/:prescId
// @access  Private (Pharmacist, Doctor, Admin)
export const updatePrescriptionStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found.",
      });
    }

    const prescription = patient.prescriptions.id(req.params.prescId);
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found.",
      });
    }

    prescription.status = status || "Dispensed";
    await patient.save();

    res.json({
      success: true,
      message: `Prescription status updated to ${prescription.status}`,
      patient,
    });
  } catch (error) {
    next(error);
  }
};
