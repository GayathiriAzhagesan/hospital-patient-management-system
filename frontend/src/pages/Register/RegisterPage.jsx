import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "../../components/layout/AuthLayout";
import { ArrowRight, Clock, CheckCircle2, ShieldAlert } from "lucide-react";

export const RegisterPage = () => {
  const { register, authError } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Patient",
    department: "General Healthcare",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pendingNotice, setPendingNotice] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    const res = await register(formData);
    setLoading(false);

    if (res.success) {
      if (res.pendingApproval) {
        setPendingNotice({
          name: formData.name,
          role: formData.role,
          message:
            res.message ||
            "Your registration has been submitted and is awaiting administrator verification.",
        });
      } else if (res.user) {
        navigate(`/dashboard/${res.user.role.toLowerCase()}`);
      }
    } else {
      setError(res.error || "Registration failed. Please try again.");
    }
  };

  if (pendingNotice) {
    return (
      <AuthLayout
        title="Application Submitted"
        subtitle="Staff verification & credentialing in progress"
      >
        <div
          style={{
            textAlign: "center",
            padding: "20px 0",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "#fef3c7",
              color: "#b45309",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px auto",
              border: "2px solid #fde68a",
            }}
          >
            <Clock size={30} />
          </div>

          <h3
            style={{
              fontSize: "1.25rem",
              fontWeight: 800,
              color: "var(--slate-900)",
              marginBottom: "8px",
            }}
          >
            Approval Pending
          </h3>

          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--slate-600)",
              lineHeight: 1.6,
              marginBottom: "20px",
            }}
          >
            Thank you, <strong>{pendingNotice.name}</strong>. Your registration request for the{" "}
            <strong style={{ color: "var(--primary-700)" }}>{pendingNotice.role}</strong> portal
            has been securely recorded.
          </p>

          <div
            style={{
              background: "var(--slate-50)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-md)",
              padding: "16px",
              textAlign: "left",
              fontSize: "0.8125rem",
              color: "var(--slate-600)",
              marginBottom: "24px",
            }}
          >
            <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
              <ShieldAlert size={16} color="#d97706" style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>
                <strong style={{ color: "var(--slate-900)" }}>Hospital Security Protocol:</strong>
                <p style={{ marginTop: "4px" }}>
                  To ensure clinical safety and HIPAA compliance, all Doctor and Pharmacist accounts
                  require manual credential verification by hospital administration before access is granted.
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/login"
            className="btn btn-primary"
            style={{ width: "100%", padding: "12px", justifyContent: "center" }}
          >
            Proceed to Login <ArrowRight size={16} />
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Register as a Patient, Doctor, or Pharmacist"
    >
      {(error || authError) && (
        <div
          style={{
            padding: "10px 14px",
            background: "#fef2f2",
            border: "1px solid #fecdd3",
            borderRadius: "var(--radius-md)",
            color: "var(--rose-600)",
            fontSize: "0.875rem",
            marginBottom: "20px",
          }}
        >
          {error || authError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input
            type="text"
            className="form-input"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Dr. Jane Doe or John Smith"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            className="form-input"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="e.g. user@medicare.health"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-input"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Minimum 6 characters"
            required
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div className="form-group">
            <label className="form-label">System Role</label>
            <select
              className="form-select"
              value={formData.role}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  role: e.target.value,
                  department:
                    e.target.value === "Doctor"
                      ? "Cardiology"
                      : e.target.value === "Pharmacist"
                      ? "Central Pharmacy"
                      : "General Healthcare",
                })
              }
            >
              <option value="Patient">Patient (Immediate Access)</option>
              <option value="Doctor">Doctor (Requires Admin Approval)</option>
              <option value="Pharmacist">Pharmacist (Requires Admin Approval)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="text"
              className="form-input"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="e.g. +91 98765 43210"
            />
          </div>
        </div>

        {formData.role === "Doctor" && (
          <div className="form-group">
            <label className="form-label">Clinical Specialty / Department</label>
            <select
              className="form-select"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            >
              <option value="Cardiology">Cardiology</option>
              <option value="General Medicine">General Medicine</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="Neurology">Neurology</option>
              <option value="Dermatology">Dermatology</option>
            </select>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
          style={{ width: "100%", marginTop: "16px", padding: "12px" }}
        >
          {loading
            ? "Submitting Application..."
            : formData.role === "Patient"
            ? "Create Patient Account"
            : `Submit ${formData.role} Registration`} <ArrowRight size={16} />
        </button>
      </form>

      <div style={{ textAlign: "center", marginTop: "24px" }}>
        <p style={{ fontSize: "0.875rem", color: "var(--slate-600)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--primary-600)", fontWeight: 700 }}>
            Login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
