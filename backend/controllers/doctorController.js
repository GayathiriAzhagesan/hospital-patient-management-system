import Doctor from "../models/Doctor.js";
import User from "../models/User.js";

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public / Private
export const getDoctors = async (req, res, next) => {
  try {
    const { specialty, department, search, status } = req.query;
    let conditions = [];

    if (specialty) {
      conditions.push({ specialty: new RegExp(specialty, "i") });
    }
    if (department) {
      conditions.push({ department: new RegExp(department, "i") });
    }
    if (status && status !== "all") {
      const s = status.toLowerCase();
      if (s === "pending") {
        conditions.push({ $or: [{ status: "pending" }, { approved: false }] });
      } else if (s === "approved") {
        conditions.push({ $or: [{ status: "approved" }, { approved: true }, { status: { $exists: false } }] });
      } else {
        conditions.push({ status: s });
      }
    }
    if (search) {
      const searchRegex = new RegExp(search, "i");
      conditions.push({
        $or: [
          { name: searchRegex },
          { specialty: searchRegex },
          { department: searchRegex },
          { email: searchRegex },
          { licenseNumber: searchRegex },
        ],
      });
    }

    const query =
      conditions.length > 0
        ? conditions.length === 1
          ? conditions[0]
          : { $and: conditions }
        : {};

    const doctors = await Doctor.find(query).sort({ name: 1 });

    res.json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current doctor profile
// @route   GET /api/doctors/me
// @access  Private (Doctor)
export const getMyDoctorProfile = async (req, res, next) => {
  try {
    let doctor = await Doctor.findOne({ userId: req.user._id });

    if (!doctor && req.user.email) {
      doctor = await Doctor.findOne({ email: req.user.email });
      if (doctor && !doctor.userId) {
        doctor.userId = req.user._id;
        await doctor.save();
      }
    }

    if (!doctor) {
      doctor = await Doctor.create({
        name: req.user.name.startsWith("Dr.") ? req.user.name : `Dr. ${req.user.name}`,
        specialty: req.user.department || "General Medicine",
        department: req.user.department || "Outpatient Care",
        email: req.user.email,
        phone: req.user.phone || "555-0199",
        userId: req.user._id,
        avatar: req.user.avatar,
      });
    }

    res.json({
      success: true,
      doctor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single doctor by ID
// @route   GET /api/doctors/:id
// @access  Public / Private
export const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found.",
      });
    }

    res.json({
      success: true,
      doctor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new doctor profile
// @route   POST /api/doctors
// @access  Private (Admin)
export const createDoctor = async (req, res, next) => {
  try {
    const {
      name,
      specialty,
      department,
      phone,
      email,
      shift,
      availableDays,
      consultationFee,
      roomNumber,
      avatar,
      qualifications,
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Doctor name and email are required.",
      });
    }

    const doctor = await Doctor.create({
      name,
      specialty: specialty || "General Medicine",
      department: department || "Outpatient Department",
      phone: phone || "",
      email: email.trim().toLowerCase(),
      shift: shift || "Morning",
      availableDays: availableDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      consultationFee: consultationFee || 75,
      roomNumber: roomNumber || "Room 101",
      avatar: avatar || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80",
      qualifications: qualifications || "MD, MBBS",
    });

    res.status(201).json({
      success: true,
      message: "Doctor profile created successfully",
      doctor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update doctor profile
// @route   PUT /api/doctors/:id
// @access  Private (Doctor, Admin)
export const updateDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found.",
      });
    }

    res.json({
      success: true,
      message: "Doctor profile updated successfully",
      doctor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete doctor profile & account
// @route   DELETE /api/doctors/:id
// @access  Private (Admin)
export const deleteDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Try finding in Doctor collection
    let doctor = await Doctor.findById(id);
    let userId = null;
    let doctorEmail = null;

    if (doctor) {
      userId = doctor.userId;
      doctorEmail = doctor.email;
      await Doctor.findByIdAndDelete(doctor._id);
    } else {
      // 2. Check if id is a User ID for a Doctor
      const user = await User.findById(id);
      if (user && (user.role || "").toLowerCase() === "doctor") {
        userId = user._id;
        doctorEmail = user.email;
      }
    }

    // Permanently remove User authentication record so doctor cannot log in
    if (userId) {
      await User.findByIdAndDelete(userId);
    }
    if (doctorEmail) {
      await User.deleteMany({ email: doctorEmail.toLowerCase() });
      await Doctor.deleteMany({ email: doctorEmail.toLowerCase() });
    }

    if (!doctor && !userId) {
      return res.status(404).json({
        success: false,
        message: "Doctor account not found.",
      });
    }

    res.json({
      success: true,
      message: "Doctor account and credentials permanently removed from the system.",
    });
  } catch (error) {
    next(error);
  }
};
