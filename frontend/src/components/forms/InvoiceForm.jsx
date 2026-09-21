import React, { useState, useEffect } from "react";
import patientService from "../../services/patientService";
import invoiceService from "../../services/invoiceService";
import { Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

export const InvoiceForm = ({ onSuccess, onCancel }) => {
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    patientId: "",
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    paymentMethod: "Pending",
    items: [
      { description: "General Specialist Consultation", quantity: 1, amount: 100 },
    ],
  });

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await patientService.getAll();
        if (res.success && res.patients) {
          setPatients(res.patients);
          if (res.patients.length > 0) {
            setFormData((prev) => ({ ...prev, patientId: res.patients[0]._id }));
          }
        }
      } catch (err) {
        console.error("Error loading patients:", err);
      } finally {
        setLoadingPatients(false);
      }
    };
    fetchPatients();
  }, []);

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: "", quantity: 1, amount: 50 }],
    });
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length <= 1) return;
    const nextItems = [...formData.items];
    nextItems.splice(index, 1);
    setFormData({ ...formData, items: nextItems });
  };

  const handleItemChange = (index, field, value) => {
    const nextItems = [...formData.items];
    nextItems[index][field] = value;
    setFormData({ ...formData, items: nextItems });
  };

  const calculateTotal = () => {
    return formData.items.reduce(
      (acc, item) => acc + (Number(item.amount) || 0) * (Number(item.quantity) || 1),
      0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await invoiceService.create(formData);
      if (res.success) {
        onSuccess(res.invoice);
      } else {
        setError(res.message || "Failed to generate invoice.");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to generate invoice.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div
          style={{
            padding: "10px 14px",
            background: "#fef2f2",
            border: "1px solid #fecdd3",
            borderRadius: "var(--radius-md)",
            color: "var(--rose-600)",
            fontSize: "0.875rem",
            marginBottom: "16px",
          }}
        >
          {error}
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Select Patient</label>
        {loadingPatients ? (
          <p style={{ fontSize: "0.875rem", color: "var(--slate-400)" }}>Loading patient directory...</p>
        ) : (
          <select
            className="form-select"
            value={formData.patientId}
            onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
            required
          >
            {patients.map((p) => (
              <option key={p._id} value={p._id}>
                {p.firstName} {p.lastName} – {p.email || p.phone}
              </option>
            ))}
          </select>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
        <div className="form-group">
          <label className="form-label">Due Date</label>
          <input
            type="date"
            className="form-input"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Payment Channel</label>
          <select
            className="form-select"
            value={formData.paymentMethod}
            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
          >
            <option value="Pending">Pending Assignment</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Health Insurance">Health Insurance</option>
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
        </div>
      </div>

      <div style={{ marginTop: "16px", marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <label className="form-label" style={{ marginBottom: 0 }}>Billable Items & Services</label>
          <button
            type="button"
            onClick={handleAddItem}
            className="btn btn-secondary btn-sm"
          >
            <Plus size={14} /> Add Line Item
          </button>
        </div>

        {formData.items.map((item, index) => (
          <div
            key={index}
            style={{
              display: "grid",
              gridTemplateColumns: "3fr 1fr 1fr auto",
              gap: "8px",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <input
              type="text"
              className="form-input"
              placeholder="Description (e.g. ECG, Labs)"
              value={item.description}
              onChange={(e) => handleItemChange(index, "description", e.target.value)}
              required
            />
            <input
              type="number"
              min="1"
              className="form-input"
              placeholder="Qty"
              value={item.quantity}
              onChange={(e) => handleItemChange(index, "quantity", Number(e.target.value))}
              required
            />
            <input
              type="number"
              min="0"
              step="0.01"
              className="form-input"
              placeholder="Price (₹)"
              value={item.amount}
              onChange={(e) => handleItemChange(index, "amount", Number(e.target.value))}
              required
            />
            <button
              type="button"
              onClick={() => handleRemoveItem(index)}
              disabled={formData.items.length <= 1}
              style={{
                color: formData.items.length <= 1 ? "var(--slate-300)" : "var(--rose-600)",
                padding: "8px",
              }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "16px",
            padding: "12px",
            background: "var(--slate-50)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <span style={{ fontSize: "1rem", fontWeight: 700, color: "var(--slate-800)" }}>
            Total Amount: {formatCurrency(calculateTotal())}
          </span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "12px",
          marginTop: "20px",
          borderTop: "1px solid var(--border-color)",
          paddingTop: "16px",
        }}
      >
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={submitting} className="btn btn-primary">
          {submitting ? "Creating Invoice..." : "Issue Invoice"}
        </button>
      </div>
    </form>
  );
};

export default InvoiceForm;
