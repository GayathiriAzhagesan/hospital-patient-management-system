import React, { useState, useEffect } from "react";
import doctorService from "../../services/doctorService";
import appointmentService from "../../services/appointmentService";
import { useAuth } from "../../context/AuthContext";

export const AppointmentForm = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    doctorId: "",
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    time: "10:00 AM",
    reason: "General Consultation",
  });

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await doctorService.getAll();
        if (res.success && res.doctors) {
          setDoctors(res.doctors);
          if (res.doctors.length > 0) {
            setFormData((prev) => ({ ...prev, doctorId: res.doctors[0]._id }));
          }
        }
      } catch (err) {
        console.error("Error fetching doctors:", err);
      } finally {
        setLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await appointmentService.create(formData);
      if (res.success) {
        onSuccess(res.appointment);
      } else {
        setError(res.message || "Failed to schedule appointment.");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to schedule appointment.");
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
        <label className="form-label">Select Specialist / Doctor</label>
        {loadingDoctors ? (
          <p style={{ fontSize: "0.875rem", color: "var(--slate-400)" }}>Loading medical staff...</p>
        ) : (
          <select
            className="form-select"
            value={formData.doctorId}
            onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
            required
          >
            {doctors.map((doc) => (
              <option key={doc._id} value={doc._id}>
                {doc.name} – {doc.specialty} ({doc.department})
              </option>
            ))}
          </select>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
        <div className="form-group">
          <label className="form-label">Appointment Date</label>
          <input
            type="date"
            className="form-input"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Preferred Time</label>
          <select
            className="form-select"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            required
          >
            <option value="09:00 AM">09:00 AM</option>
            <option value="10:00 AM">10:00 AM</option>
            <option value="11:30 AM">11:30 AM</option>
            <option value="02:00 PM">02:00 PM</option>
            <option value="03:30 PM">03:30 PM</option>
            <option value="05:00 PM">05:00 PM</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Reason for Consultation</label>
        <textarea
          className="form-textarea"
          rows={3}
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          placeholder="Describe symptoms, routine checkup, or follow-up details..."
          required
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
          {submitting ? "Scheduling..." : "Confirm Appointment"}
        </button>
      </div>
    </form>
  );
};

export default AppointmentForm;
