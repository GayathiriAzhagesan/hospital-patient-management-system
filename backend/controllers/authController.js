import User from "../models/User.js";
import Doctor from "../models/Doctor.js";
import generateToken from "../utils/generateToken.js";

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role = "Patient", department, title, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: name, email, and password.",
      });
    }

    // 1. Enforce Role Validation & Disallow Admin Registration via UI
    if (role === "Admin") {
      return res.status(403).json({
        success: false,
        message: "Administrator accounts cannot be created through public registration.",
      });
    }

    const allowedRoles = ["Patient", "Doctor", "Pharmacist"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role specified. Allowed roles: ${allowedRoles.join(", ")}`,
      });
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
    const status = role === "Patient" ? "approved" : "pending";

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role,
      status,
      department:
        department ||
        (role === "Doctor"
          ? "General Medicine"
          : role === "Pharmacist"
          ? "Central Pharmacy"
          : "General Healthcare"),
      title: title || `${role} Member`,
      phone: phone || "",
    });

    // 3. For Doctors, pre-create the doctor directory profile so specialty/shift are ready upon approval
    if (role === "Doctor") {
      try {
        await Doctor.create({
          userId: user._id,
          name: user.name,
          email: user.email,
          specialty: department || "General Medicine",
          department: department || "Outpatient Department",
          phone: phone || "",
          shift: "Morning",
          roomNumber: "Consultation Room",
        });
      } catch (docErr) {
        console.warn("Notice: Doctor profile pre-creation deferred:", docErr.message);
      }
    }

    // 4. Response handling based on approval state
    if (status === "pending") {
      return res.status(201).json({
        success: true,
        pendingApproval: true,
        message:
          "Registration submitted successfully. Your account is awaiting administrator approval before you can log in.",
        token: null,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          title: user.title,
          department: user.department,
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
    const { email, password } = req.body;

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

    // Check account approval status
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
        message:
          "Your registration request has been rejected by the administrator. Please contact hospital administration.",
      });
    }

    // User is approved -> generate token and log in
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
        status: user.status,
        avatar: user.avatar,
        title: user.title,
        department: user.department,
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
    const pendingUsers = await User.find({ status: "pending" })
      .select("-password")
      .sort({ createdAt: -1 });

    const pendingDoctors = pendingUsers.filter((u) => u.role === "Doctor");
    const pendingPharmacists = pendingUsers.filter((u) => u.role === "Pharmacist");

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
    let filter = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
      ];
    }

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
    const { status } = req.body;
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
    if (targetUser.role === "Admin" && status !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Cannot revoke Administrator status.",
      });
    }

    targetUser.status = status;
    await targetUser.save();

    // If user is a Doctor and approved, ensure Doctor record exists
    if (targetUser.role === "Doctor" && status === "approved") {
      let doc = await Doctor.findOne({ userId: targetUser._id });
      if (!doc) {
        await Doctor.create({
          userId: targetUser._id,
          name: targetUser.name,
          email: targetUser.email,
          specialty: targetUser.department || "General Medicine",
          department: targetUser.department || "Outpatient Department",
          phone: targetUser.phone || "",
          shift: "Morning",
          roomNumber: "Consultation Room",
        });
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
      },
    });
  } catch (error) {
    next(error);
  }
};
