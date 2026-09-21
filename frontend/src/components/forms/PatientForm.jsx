import React, { useState } from "react";
import patientService from "../../services/patientService";

export const PatientForm = ({ initialData, onSuccess, onCancel }) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    dob: initialData?.dob || "1990-01-01",
    gender: initialData?.gender || "male",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    address: initialData?.address || "",
    bloodGroup: initialData?.bloodGroup || "O+",
    allergies: initialData?.allergies || "None reported",
    history: initialData?.history || "No prior major medical operations.",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      let res;
      if (initialData?._id) {
        res = await patientService.update(initialData._id, formData);
      } else {
        res = await patientService.create(formData);
      }

      if (res.success) {
        onSuccess(res.patient);
      } else {
        setError(res.message || "Failed to save patient record.");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to save patient record.");
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
        <div className="form-group">
          <label className="form-label">First Name</label>
          <input
            type="text"
            className="form-input"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Last Name</label>
          <input
            type="text"
            className="form-input"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            required
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-input"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Phone Number</label>
          <input
            type="text"
            className="form-input"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
        <div className="form-group">
          <label className="form-label">Gender</label>
          <select
            className="form-select"
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Blood Group</label>
          <select
            className="form-select"
            value={formData.bloodGroup}
            onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
          >
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Known Allergies</label>
        <input
          type="text"
          className="form-input"
          value={formData.allergies}
          onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
          placeholder="e.g. Penicillin, Peanuts, Sulfa"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Medical History & Notes</label>
        <textarea
          className="form-textarea"
          rows={3}
          value={formData.history}
          onChange={(e) => setFormData({ ...formData, history: e.target.value })}
          placeholder="Past surgeries, chronic conditions, family medical history..."
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "12px",
          marginTop: "24px",
          borderTop: "1px solid var(--border-color)",
          paddingTop: "16px",
        }}
      >
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={submitting} className="btn btn-primary">
          {submitting ? "Saving..." : initialData?._id ? "Update Record" : "Create Patient"}
        </button>
      </div>
    </form>
  );
};

export default PatientForm;
