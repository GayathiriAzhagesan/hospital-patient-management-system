import express from "express";
import {
  getPatients,
  getMyPatientProfile,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  addPrescription,
  updatePrescriptionStatus,
} from "../controllers/patientController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/me", authorizeRoles("Patient"), getMyPatientProfile);
router.get("/", authorizeRoles("Doctor", "Pharmacist", "Admin"), getPatients);
router.post("/", authorizeRoles("Doctor", "Admin"), createPatient);

router.get("/:id", getPatientById);
router.put("/:id", authorizeRoles("Doctor", "Admin"), updatePatient);
router.delete("/:id", authorizeRoles("Admin"), deletePatient);

router.post("/:id/prescriptions", authorizeRoles("Doctor"), addPrescription);
router.patch("/:id/prescriptions/:prescId", authorizeRoles("Pharmacist", "Doctor", "Admin"), updatePrescriptionStatus);

export default router;
