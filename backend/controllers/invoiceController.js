import Invoice from "../models/Invoice.js";
import Patient from "../models/Patient.js";

// @desc    Get invoices with role-filtering
// @route   GET /api/invoices
// @access  Private
export const getInvoices = async (req, res, next) => {
  try {
    const { status, paid } = req.query;
    let filter = {};

    if (status) {
      filter.paymentStatus = status;
    }
    if (paid !== undefined) {
      filter.paid = paid === "true";
    }

    if (req.user.role === "Patient") {
      const patient = await Patient.findOne({
        $or: [{ userId: req.user._id }, { email: req.user.email }],
      });
      if (patient) {
        filter.patientId = patient._id;
      } else {
        return res.json({ success: true, count: 0, invoices: [] });
      }
    }

    const invoices = await Invoice.find(filter)
      .populate("patientId", "firstName lastName email phone")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: invoices.length,
      invoices,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single invoice by ID
// @route   GET /api/invoices/:id
// @access  Private
export const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate("patientId");

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found.",
      });
    }

    res.json({
      success: true,
      invoice,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new invoice
// @route   POST /api/invoices
// @access  Private (Admin, Doctor)
export const createInvoice = async (req, res, next) => {
  try {
    const {
      patientId,
      items,
      tax = 0,
      dueDate,
      paymentMethod = "Pending",
      insuranceClaimId = "",
    } = req.body;

    if (!patientId || !items || !items.length) {
      return res.status(400).json({
        success: false,
        message: "Please specify a patientId and at least one billable item.",
      });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found.",
      });
    }

    const subtotal = items.reduce(
      (acc, item) => acc + (Number(item.amount) || 0) * (Number(item.quantity) || 1),
      0
    );
    const total = subtotal + Number(tax);

    const invoice = await Invoice.create({
      patientId,
      patientName: `${patient.firstName} ${patient.lastName}`,
      items,
      subtotal,
      tax,
      total,
      paid: false,
      paymentStatus: "Pending",
      dueDate: dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      paymentMethod,
      insuranceClaimId,
    });

    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      invoice,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update invoice status (e.g. mark as Paid)
// @route   PUT /api/invoices/:id/status
// @access  Private (Admin, Patient)
export const updateInvoiceStatus = async (req, res, next) => {
  try {
    const { paid, paymentMethod, paymentStatus } = req.body;

    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found.",
      });
    }

    if (paid !== undefined) {
      invoice.paid = Boolean(paid);
      invoice.paymentStatus = paid ? "Paid" : (paymentStatus || "Pending");
    }
    if (paymentMethod) {
      invoice.paymentMethod = paymentMethod;
    }
    if (paymentStatus && !paid) {
      invoice.paymentStatus = paymentStatus;
    }

    await invoice.save();

    res.json({
      success: true,
      message: `Invoice marked as ${invoice.paymentStatus}`,
      invoice,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
// @access  Private (Admin)
export const deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found.",
      });
    }

    res.json({
      success: true,
      message: "Invoice deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
