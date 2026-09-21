import React from "react";
import StatusBadge from "../common/StatusBadge";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { Check, Eye } from "lucide-react";

export const InvoiceTable = ({ invoices, onPayInvoice, onViewDetails, canManage = false }) => {
  if (!invoices || invoices.length === 0) {
    return (
      <div
        style={{
          padding: "48px 24px",
          textAlign: "center",
          color: "var(--slate-400)",
          background: "#ffffff",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border-color)",
        }}
      >
        <p style={{ fontSize: "1rem", fontWeight: 500 }}>No invoices found.</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="custom-table">
        <thead>
          <tr>
            <th>Invoice ID</th>
            <th>Patient Name</th>
            <th>Due Date</th>
            <th>Total Amount</th>
            <th>Payment Method</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv._id}>
              <td style={{ fontWeight: 700, color: "var(--slate-900)" }}>
                {inv.invoiceNumber}
              </td>
              <td>
                <div style={{ fontWeight: 600 }}>{inv.patientName || inv.patientId?.name || "Patient"}</div>
                {inv.insuranceClaimId && (
                  <div style={{ fontSize: "0.75rem", color: "var(--primary-600)" }}>
                    Claim: {inv.insuranceClaimId}
                  </div>
                )}
              </td>
              <td>{formatDate(inv.dueDate)}</td>
              <td style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--slate-900)" }}>
                {formatCurrency(inv.total)}
              </td>
              <td style={{ fontSize: "0.8125rem", color: "var(--slate-600)" }}>
                {inv.paymentMethod || "Pending"}
              </td>
              <td>
                <StatusBadge status={inv.paymentStatus || (inv.paid ? "Paid" : "Pending")} />
              </td>
              <td>
                <div style={{ display: "flex", gap: "8px" }}>
                  {onViewDetails && (
                    <button
                      onClick={() => onViewDetails(inv)}
                      className="btn btn-secondary btn-sm"
                      title="View Invoice Items"
                    >
                      <Eye size={14} /> View
                    </button>
                  )}
                  {!inv.paid && onPayInvoice && (
                    <button
                      onClick={() => onPayInvoice(inv._id)}
                      className="btn btn-primary btn-sm"
                      style={{ background: "linear-gradient(135deg, var(--emerald-500), var(--emerald-600))" }}
                      title="Settle Invoice"
                    >
                      <Check size={14} /> Pay Now
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InvoiceTable;
