import mongoose from "mongoose";

const InvoiceItemSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: [true, "Item description is required"],
    },
    quantity: {
      type: Number,
      default: 1,
    },
    amount: {
      type: Number,
      required: [true, "Item amount is required"],
      default: 0,
    },
  },
  { _id: false }
);

const InvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      unique: true,
      default: () => `INV-${Date.now().toString().slice(-6)}`,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: [true, "Patient ID is required"],
    },
    patientName: {
      type: String,
      default: "Standard Patient",
    },
    items: [InvoiceItemSchema],
    subtotal: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: [true, "Total amount is required"],
      default: 0,
    },
    paid: {
      type: Boolean,
      default: false,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Overdue", "Refunded"],
      default: "Pending",
    },
    dueDate: {
      type: String,
      default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Credit Card", "Health Insurance", "Bank Transfer", "Pending"],
      default: "Pending",
    },
    insuranceClaimId: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save calculation of total if not provided
InvoiceSchema.pre("save", function (next) {
  if (this.items && this.items.length > 0) {
    this.subtotal = this.items.reduce(
      (acc, item) => acc + (item.amount || 0) * (item.quantity || 1),
      0
    );
    this.total = this.subtotal + (this.tax || 0);
  }
  if (this.paid) {
    this.paymentStatus = "Paid";
  }
  if (next) next();
});

export const Invoice = mongoose.models.Invoice || mongoose.model("Invoice", InvoiceSchema);
export default Invoice;
