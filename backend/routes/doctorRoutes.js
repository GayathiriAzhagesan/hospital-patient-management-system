import express from "express";
import {
  getDoctors,
  getMyDoctorProfile,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from "../controllers/doctorController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Allow browsing doctors (public or authenticated)
router.get("/", getDoctors);

// Authenticated routes
router.get("/me", protect, authorizeRoles("Doctor"), getMyDoctorProfile);
router.get("/:id", getDoctorById);

router.post("/", protect, authorizeRoles("Admin"), createDoctor);
router.put("/:id", protect, authorizeRoles("Doctor", "Admin"), updateDoctor);
router.delete("/:id", protect, authorizeRoles("Admin"), deleteDoctor);

export default router;
