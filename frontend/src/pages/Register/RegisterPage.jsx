import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "../../components/layout/AuthLayout";
import { ArrowRight } from "lucide-react";

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

    if (res.success && res.user) {
      navigate(`/dashboard/${res.user.role.toLowerCase()}`);
    } else {
      setError(res.error || "Registration failed. Please try again.");
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Register as a Patient, Doctor, Pharmacist, or Hospital Staff"
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
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="Patient">Patient</option>
              <option value="Doctor">Doctor</option>
              <option value="Pharmacist">Pharmacist</option>
              <option value="Admin">Administrator</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Phone</label>
            <input
              type="text"
              className="form-input"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="e.g. 555-0199"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
          style={{ width: "100%", marginTop: "16px", padding: "12px" }}
        >
          {loading ? "Creating Account..." : "Create Account"} <ArrowRight size={16} />
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
