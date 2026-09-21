import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  getPendingApprovals,
  getAllUsers,
  updateUserStatus,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Public Authentication Endpoints
router.post("/register", registerUser);
router.post("/login", loginUser);

// User Profile (Authenticated)
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);

// Administrator Role & Staff Credentialing Endpoints
router.get("/pending-approvals", protect, authorizeRoles("Admin"), getPendingApprovals);
router.get("/users", protect, authorizeRoles("Admin"), getAllUsers);
router.patch("/users/:id/status", protect, authorizeRoles("Admin"), updateUserStatus);

export default router;
