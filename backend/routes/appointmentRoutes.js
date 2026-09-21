import express from "express";
import {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointmentStatus,
  deleteAppointment,
} from "../controllers/appointmentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getAppointments);
router.get("/:id", getAppointmentById);
router.post("/", authorizeRoles("Patient", "Doctor", "Admin"), createAppointment);
router.put("/:id/status", authorizeRoles("Doctor", "Admin"), updateAppointmentStatus);
router.delete("/:id", deleteAppointment);

export default router;
