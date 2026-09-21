import React, { useState, useEffect } from "react";
import invoiceService from "../../services/invoiceService";
import { useAuth } from "../../context/AuthContext";
import InvoiceTable from "../../components/tables/InvoiceTable";
import Modal from "../../components/common/Modal";
import InvoiceForm from "../../components/forms/InvoiceForm";
import StatCard from "../../components/common/StatCard";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { CreditCard, CheckCircle2, Clock, Plus, Receipt } from "lucide-react";

export const BillingPage = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await invoiceService.getAll();
      if (res.success && res.invoices) {
        setInvoices(res.invoices);
      }
    } catch (err) {
      console.error("Failed to load invoices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handlePay = async (id) => {
    if (!window.confirm("Confirm payment settlement for this invoice?")) return;
    try {
      await invoiceService.updateStatus(id, {
        paid: true,
        paymentStatus: "Paid",
        paymentMethod: "Credit Card",
      });
      fetchInvoices();
    } catch (err) {
      alert("Failed to settle invoice payment");
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    if (filter === "paid") return inv.paid;
    if (filter === "pending") return !inv.paid;
    return true;
  });

  const totalCollected = invoices
    .filter((inv) => inv.paid)
    .reduce((acc, inv) => acc + (inv.total || 0), 0);

  const totalPending = invoices
    .filter((inv) => !inv.paid)
    .reduce((acc, inv) => acc + (inv.total || 0), 0);

  const canCreateInvoice = user?.role === "Admin" || user?.role === "Doctor";

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--slate-900)" }}>
            Hospital Billing & Invoices
          </h1>
          <p style={{ color: "var(--slate-500)", marginTop: "4px" }}>
            Transparent itemized medical statements, insurance claims, and payment settlements
          </p>
        </div>

        {canCreateInvoice && (
          <button onClick={() => setIsCreateOpen(true)} className="btn btn-primary">
            <Plus size={18} /> Generate Invoice
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid-cols-3" style={{ marginBottom: "28px" }}>
        <StatCard
          title="Total Invoiced"
          value={formatCurrency(totalCollected + totalPending)}
          change={`${invoices.length} Total Billing Records`}
          icon={CreditCard}
          color="teal"
        />
        <StatCard
          title="Settled & Paid"
          value={formatCurrency(totalCollected)}
          change="Cleared Funds"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Outstanding Balance"
          value={formatCurrency(totalPending)}
          change="Awaiting Patient / Insurance"
          icon={Clock}
          color="amber"
        />
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "20px",
          borderBottom: "1px solid var(--border-color)",
          paddingBottom: "12px",
        }}
      >
        <button
          onClick={() => setFilter("all")}
          className={`btn btn-sm ${filter === "all" ? "btn-primary" : "btn-secondary"}`}
        >
          All Invoices ({invoices.length})
        </button>
        <button
          onClick={() => setFilter("pending")}
          className={`btn btn-sm ${filter === "pending" ? "btn-primary" : "btn-secondary"}`}
        >
          Pending ({invoices.filter((i) => !i.paid).length})
        </button>
        <button
          onClick={() => setFilter("paid")}
          className={`btn btn-sm ${filter === "paid" ? "btn-primary" : "btn-secondary"}`}
        >
          Settled / Paid ({invoices.filter((i) => i.paid).length})
        </button>
      </div>

      {loading ? (
        <div style={{ padding: "60px 0", textAlign: "center", color: "var(--slate-400)" }}>
          Loading financial invoice records...
        </div>
      ) : (
        <InvoiceTable
          invoices={filteredInvoices}
          onPayInvoice={handlePay}
          onViewDetails={(inv) => setSelectedInvoice(inv)}
          canManage={canCreateInvoice}
        />
      )}

      {/* Invoice Breakdown Modal */}
      <Modal
        isOpen={Boolean(selectedInvoice)}
        onClose={() => setSelectedInvoice(null)}
        title={`Invoice Breakdown – ${selectedInvoice?.invoiceNumber}`}
        maxWidth="600px"
      >
        {selectedInvoice && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", paddingBottom: "12px", borderBottom: "1px solid var(--border-color)" }}>
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--slate-400)", fontWeight: 700 }}>BILLED TO</span>
                <p style={{ fontWeight: 700, fontSize: "1rem", color: "var(--slate-900)" }}>
                  {selectedInvoice.patientName}
                </p>
                {selectedInvoice.insuranceClaimId && (
                  <p style={{ fontSize: "0.8125rem", color: "var(--primary-600)" }}>
                    Insurance Claim: {selectedInvoice.insuranceClaimId}
                  </p>
                )}
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--slate-400)", fontWeight: 700 }}>DUE DATE</span>
                <p style={{ fontWeight: 600 }}>{formatDate(selectedInvoice.dueDate)}</p>
                <span
                  style={{
                    display: "inline-block",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    marginTop: "4px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    background: selectedInvoice.paid ? "#dcfce7" : "#fef3c7",
                    color: selectedInvoice.paid ? "#15803d" : "#b45309",
                  }}
                >
                  {selectedInvoice.paymentStatus || (selectedInvoice.paid ? "PAID" : "PENDING")}
                </span>
              </div>
            </div>

            {/* Line Items */}
            <div style={{ marginBottom: "20px" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--slate-500)", fontWeight: 700 }}>ITEMIZED MEDICAL CHARGES</span>
              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "8px", fontSize: "0.875rem" }}>
                <thead>
                  <tr style={{ background: "var(--slate-50)", textAlign: "left" }}>
                    <th style={{ padding: "8px" }}>Description</th>
                    <th style={{ padding: "8px", textAlign: "center" }}>Qty</th>
                    <th style={{ padding: "8px", textAlign: "right" }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedInvoice.items || []).map((item, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--slate-100)" }}>
                      <td style={{ padding: "8px" }}>{item.description}</td>
                      <td style={{ padding: "8px", textAlign: "center" }}>{item.quantity || 1}</td>
                      <td style={{ padding: "8px", textAlign: "right", fontWeight: 600 }}>
                        {formatCurrency((item.amount || 0) * (item.quantity || 1))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div style={{ padding: "16px", background: "var(--slate-50)", borderRadius: "var(--radius-md)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "0.8125rem", color: "var(--slate-500)" }}>Payment Channel</span>
                <p style={{ fontWeight: 600 }}>{selectedInvoice.paymentMethod || "Pending"}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "0.8125rem", color: "var(--slate-500)" }}>Total Amount</span>
                <p style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--slate-900)" }}>
                  {formatCurrency(selectedInvoice.total)}
                </p>
              </div>
            </div>

            {!selectedInvoice.paid && (
              <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={() => {
                    handlePay(selectedInvoice._id);
                    setSelectedInvoice(null);
                  }}
                  className="btn btn-primary"
                  style={{ background: "linear-gradient(135deg, var(--emerald-500), var(--emerald-600))" }}
                >
                  <CheckCircle2 size={16} /> Mark as Paid / Settle
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Create Invoice Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Issue New Clinical Billing Invoice"
        maxWidth="640px"
      >
        <InvoiceForm
          onSuccess={() => {
            setIsCreateOpen(false);
            fetchInvoices();
          }}
          onCancel={() => setIsCreateOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default BillingPage;
