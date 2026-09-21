import express from "express";
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoiceStatus,
  deleteInvoice,
} from "../controllers/invoiceController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getInvoices);
router.get("/:id", getInvoiceById);
router.post("/", authorizeRoles("Admin", "Doctor"), createInvoice);
router.put("/:id/status", updateInvoiceStatus);
router.delete("/:id", authorizeRoles("Admin"), deleteInvoice);

export default router;
