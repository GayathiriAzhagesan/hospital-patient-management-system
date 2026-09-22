import User from "../models/User.js";
import Doctor from "../models/Doctor.js";
import generateToken from "../utils/generateToken.js";

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role = "Patient",
      department,
      title,
      phone,
      specialization,
      qualification,
      licenseNumber,
      experience,
      hospitalClinic,
      pharmacyName,
      pharmacyAddress,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: name, email, and password.",
      });
    }

    // 1. Enforce Role Validation & Disallow Admin Registration via UI
    const normalizedRoleInput = (role || "Patient").trim().toLowerCase();
    if (normalizedRoleInput === "admin") {
      return res.status(403).json({
        success: false,
        message: "Administrator accounts cannot be created through public registration.",
      });
    }

    const roleMap = {
      patient: "Patient",
      doctor: "Doctor",
      pharmacist: "Pharmacist",
    };

    const canonicalRole = roleMap[normalizedRoleInput];
    if (!canonicalRole) {
      return res.status(400).json({
        success: false,
        message: "Invalid role specified. Allowed roles: Patient, Doctor, Pharmacist",
      });
    }

    // Validate role-specific required information
    if (canonicalRole === "Doctor") {
      const docSpec = specialization || department;
      if (!phone || !docSpec || !qualification || !licenseNumber || !experience || !hospitalClinic) {
        return res.status(400).json({
          success: false,
          message:
            "Please provide all required doctor credentials: Phone, Specialization, Qualification, Medical License Number, Years of Experience, and Hospital / Clinic.",
        });
      }
    }

    if (canonicalRole === "Pharmacist") {
      if (!phone || !pharmacyName || !pharmacyAddress || !licenseNumber || !qualification || !experience) {
        return res.status(400).json({
          success: false,
          message:
            "Please provide all required pharmacist credentials: Phone, Pharmacy Name, Pharmacy Address, Pharmacist License Number, Qualification, and Years of Experience.",
        });
      }
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email address already exists.",
      });
    }

    // 2. Determine Approval Status
    // Patients are automatically approved; Doctors and Pharmacists require Admin review
    const status = canonicalRole === "Patient" ? "approved" : "pending";

    const assignedDepartment =
      specialization ||
      department ||
      (canonicalRole === "Doctor"
        ? "General Medicine"
        : canonicalRole === "Pharmacist"
        ? "Central Pharmacy"
        : "General Healthcare");

    const assignedTitle =
      title ||
      (canonicalRole === "Doctor"
        ? "Dr."
        : canonicalRole === "Pharmacist"
        ? "Pharmacist"
        : "Patient Member");

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: canonicalRole,
      status,
      department: assignedDepartment,
      title: assignedTitle,
      phone: phone || "",
      specialization: specialization || department || "",
      qualification: qualification || "",
      licenseNumber: licenseNumber || "",
      experience: experience || "",
      hospitalClinic: hospitalClinic || "",
      pharmacyName: pharmacyName || "",
      pharmacyAddress: pharmacyAddress || "",
    });

    // 3. Response handling based on approval state
    if (status === "pending") {
      // If doctor, also create linked Doctor profile with status pending
      if (canonicalRole === "Doctor") {
        try {
          await Doctor.create({
            userId: user._id,
            name: user.name.startsWith("Dr.") ? user.name : `Dr. ${user.name}`,
            email: user.email,
            specialty: user.specialization || user.department || "General Medicine",
            department: user.hospitalClinic || user.department || "Outpatient Department",
            phone: user.phone || "",
            shift: "Morning",
            roomNumber: "Consultation Room",
            qualifications: user.qualification || "MD, MBBS",
            avatar: user.avatar || "",
            licenseNumber: user.licenseNumber || "",
            status: "pending",
            approved: false,
          });
        } catch (docErr) {
          console.warn("Doctor profile creation sync warning:", docErr.message);
        }
      }

      return res.status(201).json({
        success: true,
        pendingApproval: true,
        message:
          "Registration successful. Your account is pending Admin approval. You will be able to log in after your account has been approved.",
        token: null,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          title: user.title,
          department: user.department,
          specialization: user.specialization,
          qualification: user.qualification,
          licenseNumber: user.licenseNumber,
          experience: user.experience,
          hospitalClinic: user.hospitalClinic,
          pharmacyName: user.pharmacyName,
          pharmacyAddress: user.pharmacyAddress,
          phone: user.phone,
        },
      });
    }

    // Patients are approved immediately and issued an active JWT session
    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      pendingApproval: false,
      message: "Account registered and activated successfully.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
        title: user.title,
        department: user.department,
        phone: user.phone,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and password.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Role verification (if role is specified by login endpoint / portal context)
    if (role && (user.role || "").toLowerCase() !== role.trim().toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: `Account role mismatch. You are registered as a ${user.role}. Please log in using the correct portal.`,
      });
    }

    // Clinical staff (Doctor and Pharmacist) must have 'approved' status
    const isClinicalStaff =
      (user.role || "").toLowerCase() === "doctor" ||
      (user.role || "").toLowerCase() === "pharmacist";

    if (isClinicalStaff) {
      // Safe fallback for pre-existing accounts without explicit status field
      const effectiveStatus = user.status || (user.approved === false ? "pending" : "approved");

      if (effectiveStatus === "pending") {
        return res.status(403).json({
          success: false,
          status: "pending",
          message: "Your account is awaiting administrator approval.",
        });
      }

      if (effectiveStatus === "rejected") {
        return res.status(403).json({
          success: false,
          status: "rejected",
          message: "Your registration has been rejected. Contact administrator.",
          rejectionReason: user.rejectionReason || null,
        });
      }
    } else {
      // For any other account explicitly pending or rejected
      if (user.status === "pending") {
        return res.status(403).json({
          success: false,
          status: "pending",
          message: "Your account is awaiting administrator approval.",
        });
      }
      if (user.status === "rejected") {
        return res.status(403).json({
          success: false,
          status: "rejected",
          message: "Your registration has been rejected. Contact administrator.",
        });
      }
    }

    // User is authorized and approved -> generate token and log in
    const token = generateToken(user);

    return res.json({
      success: true,
      message: "Authentication successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status || "approved",
        avatar: user.avatar,
        title: user.title,
        department: user.department,
        specialization: user.specialization,
        qualification: user.qualification,
        licenseNumber: user.licenseNumber,
        experience: user.experience,
        hospitalClinic: user.hospitalClinic,
        pharmacyName: user.pharmacyName,
        pharmacyAddress: user.pharmacyAddress,
        phone: user.phone,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar, title, department, phone } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Role and Status CANNOT be changed through profile update
    if (name) user.name = name.trim();
    if (avatar !== undefined) user.avatar = avatar;
    if (title) user.title = title;
    if (department) user.department = department;
    if (phone !== undefined) user.phone = phone;

    const updatedUser = await user.save();

    return res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending Doctor and Pharmacist registration requests
// @route   GET /api/auth/pending-approvals
// @access  Private (Admin)
export const getPendingApprovals = async (_req, res, next) => {
  try {
    const pendingUsers = await User.find({
      $and: [
        {
          role: { $in: ["Doctor", "doctor", "Pharmacist", "pharmacist"] },
        },
        {
          $or: [
            { status: "pending" },
            { approved: false },
            { status: { $exists: false } },
            { status: null },
          ],
        },
      ],
    })
      .select("-password")
      .sort({ createdAt: -1 });

    const pendingDoctors = pendingUsers.filter(
      (u) => (u.role || "").toLowerCase() === "doctor"
    );
    const pendingPharmacists = pendingUsers.filter(
      (u) => (u.role || "").toLowerCase() === "pharmacist"
    );

    res.json({
      success: true,
      count: pendingUsers.length,
      pendingDoctors,
      pendingPharmacists,
      pendingUsers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registered users with optional role & status filters
// @route   GET /api/auth/users
// @access  Private (Admin)
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, status, search } = req.query;
    let conditions = [];

    if (role && role !== "all") {
      conditions.push({ role: new RegExp(`^${role}$`, "i") });
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
          { email: searchRegex },
          { licenseNumber: searchRegex },
          { hospitalClinic: searchRegex },
          { pharmacyName: searchRegex },
          { specialization: searchRegex },
        ],
      });
    }

    const filter =
      conditions.length > 0
        ? conditions.length === 1
          ? conditions[0]
          : { $and: conditions }
        : {};

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or reject a user account
// @route   PATCH /api/auth/users/:id/status
// @access  Private (Admin)
export const updateUserStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    const { id } = req.params;

    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Allowed values: approved, rejected, pending",
      });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent modifying Admin status
    if ((targetUser.role || "").toLowerCase() === "admin" && status !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Cannot revoke Administrator status.",
      });
    }

    targetUser.status = status;
    targetUser.approved = status === "approved";
    if (status === "rejected") {
      targetUser.rejectionReason = rejectionReason ? rejectionReason.trim() : "";
    } else if (status === "approved") {
      targetUser.rejectionReason = "";
    }

    await targetUser.save();

    // If user is a Doctor, sync Doctor record in directory
    if ((targetUser.role || "").toLowerCase() === "doctor") {
      let doc = await Doctor.findOne({
        $or: [{ userId: targetUser._id }, { email: targetUser.email.toLowerCase() }],
      });

      if (status === "approved") {
        if (!doc) {
          await Doctor.create({
            userId: targetUser._id,
            name: targetUser.name.startsWith("Dr.") ? targetUser.name : `Dr. ${targetUser.name}`,
            email: targetUser.email.toLowerCase(),
            specialty: targetUser.specialization || targetUser.department || "General Medicine",
            department: targetUser.hospitalClinic || targetUser.department || "Outpatient Department",
            phone: targetUser.phone || "",
            shift: "Morning",
            roomNumber: "Consultation Room",
            qualifications: targetUser.qualification || "MD, MBBS",
            avatar: targetUser.avatar || "",
            licenseNumber: targetUser.licenseNumber || "",
            status: "approved",
            approved: true,
          });
        } else {
          doc.status = "approved";
          doc.approved = true;
          doc.userId = targetUser._id;
          if (targetUser.phone) doc.phone = targetUser.phone;
          if (targetUser.specialization) doc.specialty = targetUser.specialization;
          if (targetUser.qualification) doc.qualifications = targetUser.qualification;
          if (targetUser.licenseNumber) doc.licenseNumber = targetUser.licenseNumber;
          await doc.save();
        }
      } else if (status === "rejected") {
        if (doc) {
          doc.status = "rejected";
          doc.approved = false;
          await doc.save();
        }
      } else if (status === "pending") {
        if (doc) {
          doc.status = "pending";
          doc.approved = false;
          await doc.save();
        }
      }
    }

    res.json({
      success: true,
      message: `User '${targetUser.name}' (${targetUser.role}) has been ${status}.`,
      user: {
        id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        status: targetUser.status,
        rejectionReason: targetUser.rejectionReason,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account (Doctor, Pharmacist, Patient)
// @route   DELETE /api/auth/users/:id
// @access  Private (Admin)
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      // Check if id is a Doctor ID
      const doc = await Doctor.findById(id);
      if (doc) {
        if (doc.userId) {
          await User.findByIdAndDelete(doc.userId);
        }
        await User.deleteMany({ email: doc.email.toLowerCase() });
        await Doctor.findByIdAndDelete(id);
        return res.json({
          success: true,
          message: "Doctor account deleted successfully.",
        });
      }

      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if ((user.role || "").toLowerCase() === "admin") {
      return res.status(403).json({
        success: false,
        message: "Cannot delete Administrator accounts.",
      });
    }

    // If deleting a doctor, also remove Doctor profile and any duplicate matches
    if ((user.role || "").toLowerCase() === "doctor") {
      await Doctor.deleteMany({
        $or: [{ userId: user._id }, { email: user.email.toLowerCase() }],
      });
    }

    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: `Account for '${user.name}' has been deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

