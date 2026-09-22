import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "../../components/layout/AuthLayout";
import {
  ArrowRight,
  Clock,
  ShieldAlert,
  Stethoscope,
  Pill,
  User,
  CheckCircle2,
  Building2,
  Award,
  FileCheck,
  Briefcase,
  MapPin,
  Phone,
} from "lucide-react";

export const RegisterPage = () => {
  const { register, authError } = useAuth();
  const navigate = useNavigate();
  const { role: urlRole } = useParams();

  const getInitialRole = () => {
    if (!urlRole) return "Patient";
    const lower = urlRole.toLowerCase();
    if (lower === "doctor") return "Doctor";
    if (lower === "pharmacist") return "Pharmacist";
    return "Patient";
  };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: getInitialRole(),
    phone: "",
    // Doctor Specific Fields
    specialization: "General Medicine",
    qualification: "",
    licenseNumber: "",
    experience: "",
    hospitalClinic: "",
    // Pharmacist Specific Fields
    pharmacyName: "",
    pharmacyAddress: "",
  });

  useEffect(() => {
    if (urlRole) {
      const lower = urlRole.toLowerCase();
      if (lower === "doctor") {
        setFormData((prev) => ({ ...prev, role: "Doctor" }));
      } else if (lower === "pharmacist") {
        setFormData((prev) => ({ ...prev, role: "Pharmacist" }));
      } else if (lower === "patient") {
        setFormData((prev) => ({ ...prev, role: "Patient" }));
      }
    }
  }, [urlRole]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pendingNotice, setPendingNotice] = useState(null);

  const handleRoleChange = (selectedRole) => {
    setFormData((prev) => ({
      ...prev,
      role: selectedRole,
      specialization: selectedRole === "Doctor" ? prev.specialization || "General Medicine" : "",
    }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    // Role-specific client side validations
    if (formData.role === "Doctor") {
      if (
        !formData.phone ||
        !formData.specialization ||
        !formData.qualification ||
        !formData.licenseNumber ||
        !formData.experience ||
        !formData.hospitalClinic
      ) {
        setError(
          "Please fill in all required Doctor information (Specialization, Qualification, Medical License, Experience, Hospital/Clinic, and Phone)."
        );
        return;
      }
    }

    if (formData.role === "Pharmacist") {
      if (
        !formData.phone ||
        !formData.pharmacyName ||
        !formData.pharmacyAddress ||
        !formData.licenseNumber ||
        !formData.qualification ||
        !formData.experience
      ) {
        setError(
          "Please fill in all required Pharmacist information (Pharmacy Name, Pharmacy Address, License Number, Qualification, Experience, and Phone)."
        );
        return;
      }
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
            "Registration successful. Your account is pending Admin approval. You will be able to log in after your account is approved.",
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
        title="Registration Received"
        subtitle="Account approval is currently in progress"
      >
        <div style={{ textAlign: "center", padding: "10px 0" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "#fef3c7",
              color: "#b45309",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px auto",
              border: "2px solid #fde68a",
              boxShadow: "0 4px 12px rgba(245, 158, 11, 0.15)",
            }}
          >
            <Clock size={32} />
          </div>

          <h3
            style={{
              fontSize: "1.25rem",
              fontWeight: 800,
              color: "var(--slate-900)",
              marginBottom: "12px",
            }}
          >
            Approval Pending
          </h3>

          <div
            style={{
              background: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: "var(--radius-md)",
              padding: "16px",
              textAlign: "left",
              color: "#92400e",
              fontSize: "0.9375rem",
              lineHeight: 1.6,
              marginBottom: "20px",
              fontWeight: 600,
            }}
          >
            {pendingNotice.message}
          </div>

          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--slate-600)",
              lineHeight: 1.6,
              marginBottom: "20px",
            }}
          >
            Thank you, <strong>{pendingNotice.name}</strong>. Your registration for the{" "}
            <strong style={{ color: "var(--primary-700)" }}>{pendingNotice.role} Portal</strong>{" "}
            has been submitted. The hospital administrator will review your medical credentials and license details.
          </p>

          <div
            style={{
              background: "var(--slate-50)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-md)",
              padding: "14px",
              textAlign: "left",
              fontSize: "0.8125rem",
              color: "var(--slate-600)",
              marginBottom: "24px",
            }}
          >
            <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <ShieldAlert size={18} color="#d97706" style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>
                <strong style={{ color: "var(--slate-900)" }}>Security & Compliance Verification:</strong>
                <p style={{ marginTop: "4px" }}>
                  Healthcare provider logins are restricted until authorized by Hospital Administration to guarantee regulatory compliance and patient health record privacy.
                </p>
              </div>
            </div>
          </div>

          <Link
            to={
              pendingNotice.role === "Doctor"
                ? "/login/doctor"
                : pendingNotice.role === "Pharmacist"
                ? "/login/pharmacist"
                : "/login"
            }
            className="btn btn-primary"
            style={{ width: "100%", padding: "12px", justifyContent: "center" }}
          >
            Go to Login <ArrowRight size={16} />
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
            padding: "12px 14px",
            background: "#fef2f2",
            border: "1px solid #fecdd3",
            borderRadius: "var(--radius-md)",
            color: "var(--rose-600)",
            fontSize: "0.875rem",
            marginBottom: "20px",
            lineHeight: 1.5,
          }}
        >
          {error || authError}
        </div>
      )}

      {/* Role Selection Segmented Control */}
      <div style={{ marginBottom: "20px" }}>
        <label className="form-label" style={{ marginBottom: "8px" }}>
          Select Account Role
        </label>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "8px",
            background: "var(--slate-100)",
            padding: "4px",
            borderRadius: "var(--radius-md)",
          }}
        >
          <button
            type="button"
            onClick={() => handleRoleChange("Patient")}
            style={{
              padding: "10px 8px",
              borderRadius: "var(--radius-sm)",
              border: "none",
              cursor: "pointer",
              fontSize: "0.8125rem",
              fontWeight: 700,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              background: formData.role === "Patient" ? "#ffffff" : "transparent",
              color: formData.role === "Patient" ? "var(--primary-700)" : "var(--slate-600)",
              boxShadow: formData.role === "Patient" ? "var(--shadow-sm)" : "none",
              transition: "all 0.2s ease",
            }}
          >
            <User size={16} />
            <span>Patient</span>
            <span style={{ fontSize: "0.6875rem", fontWeight: 500, color: "var(--emerald-600)" }}>
              Instant Access
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange("Doctor")}
            style={{
              padding: "10px 8px",
              borderRadius: "var(--radius-sm)",
              border: "none",
              cursor: "pointer",
              fontSize: "0.8125rem",
              fontWeight: 700,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              background: formData.role === "Doctor" ? "#ffffff" : "transparent",
              color: formData.role === "Doctor" ? "var(--primary-700)" : "var(--slate-600)",
              boxShadow: formData.role === "Doctor" ? "var(--shadow-sm)" : "none",
              transition: "all 0.2s ease",
            }}
          >
            <Stethoscope size={16} />
            <span>Doctor</span>
            <span style={{ fontSize: "0.6875rem", fontWeight: 500, color: "var(--amber-600)" }}>
              Admin Approval
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange("Pharmacist")}
            style={{
              padding: "10px 8px",
              borderRadius: "var(--radius-sm)",
              border: "none",
              cursor: "pointer",
              fontSize: "0.8125rem",
              fontWeight: 700,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              background: formData.role === "Pharmacist" ? "#ffffff" : "transparent",
              color: formData.role === "Pharmacist" ? "var(--primary-700)" : "var(--slate-600)",
              boxShadow: formData.role === "Pharmacist" ? "var(--shadow-sm)" : "none",
              transition: "all 0.2s ease",
            }}
          >
            <Pill size={16} />
            <span>Pharmacist</span>
            <span style={{ fontSize: "0.6875rem", fontWeight: 500, color: "var(--amber-600)" }}>
              Admin Approval
            </span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Core Common Fields */}
        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input
            type="text"
            className="form-input"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder={
              formData.role === "Doctor"
                ? "e.g. Dr. Rajesh Sharma"
                : formData.role === "Pharmacist"
                ? "e.g. Sarah Jenkins"
                : "e.g. Ananya Patel"
            }
            required
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              className="form-input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="name@medicare.health"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number *</label>
            <input
              type="tel"
              className="form-input"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 98765 43210"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Password *</label>
          <input
            type="password"
            className="form-input"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Minimum 6 characters"
            required
          />
        </div>

        {/* Doctor Specific Form Fields */}
        {formData.role === "Doctor" && (
          <div
            style={{
              marginTop: "16px",
              padding: "16px",
              background: "var(--slate-50)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "14px" }}>
              <Stethoscope size={16} color="var(--primary-600)" />
              <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--slate-900)" }}>
                Physician Credentials & Licensing
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Specialization *</label>
                <select
                  className="form-select"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  required
                >
                  <option value="General Medicine">General Medicine</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Pediatrics & Neonatal Care">Pediatrics & Neonatal Care</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Orthopedic Surgery">Orthopedic Surgery</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Oncology">Oncology</option>
                  <option value="Gynecology">Gynecology</option>
                  <option value="Psychiatry">Psychiatry</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Qualification *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  placeholder="e.g. MBBS, MD, MS"
                  required
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Medical License / Reg No. *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  placeholder="e.g. MCI-78291 / SMC-4412"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Years of Experience *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  placeholder="e.g. 10 Years"
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Hospital / Clinic *</label>
              <input
                type="text"
                className="form-input"
                value={formData.hospitalClinic}
                onChange={(e) => setFormData({ ...formData, hospitalClinic: e.target.value })}
                placeholder="e.g. Medicare Central Hospital / City Health Clinic"
                required
              />
            </div>
          </div>
        )}

        {/* Pharmacist Specific Form Fields */}
        {formData.role === "Pharmacist" && (
          <div
            style={{
              marginTop: "16px",
              padding: "16px",
              background: "var(--slate-50)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "14px" }}>
              <Pill size={16} color="var(--primary-600)" />
              <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--slate-900)" }}>
                Pharmacy Details & Pharmacy License
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Pharmacy Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.pharmacyName}
                  onChange={(e) => setFormData({ ...formData, pharmacyName: e.target.value })}
                  placeholder="e.g. Medicare Central Pharmacy"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Qualification *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  placeholder="e.g. B.Pharm, M.Pharm, Pharm.D"
                  required
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Pharmacist License / Reg No. *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  placeholder="e.g. PCI-98214"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Years of Experience *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  placeholder="e.g. 5 Years"
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Pharmacy Address *</label>
              <input
                type="text"
                className="form-input"
                value={formData.pharmacyAddress}
                onChange={(e) => setFormData({ ...formData, pharmacyAddress: e.target.value })}
                placeholder="e.g. 104 Health Ave, Wing B, Ground Floor"
                required
              />
            </div>
          </div>
        )}

        {/* Notice for Doctor/Pharmacist accounts */}
        {formData.role !== "Patient" && (
          <div
            style={{
              marginTop: "16px",
              padding: "10px 14px",
              background: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.8125rem",
              color: "#92400e",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Clock size={16} style={{ flexShrink: 0 }} />
            <span>
              Doctor and Pharmacist accounts require Administrator review and approval before login access is granted.
            </span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
          style={{ width: "100%", marginTop: "20px", padding: "12px" }}
        >
          {loading
            ? "Submitting Registration..."
            : formData.role === "Patient"
            ? "Create Patient Account"
            : `Submit ${formData.role} Registration`} <ArrowRight size={16} />
        </button>
      </form>

      <div style={{ textAlign: "center", marginTop: "24px" }}>
        <p style={{ fontSize: "0.875rem", color: "var(--slate-600)" }}>
          Already have an account?{" "}
          <Link
            to={
              formData.role === "Doctor"
                ? "/login/doctor"
                : formData.role === "Pharmacist"
                ? "/login/pharmacist"
                : "/login"
            }
            style={{ color: "var(--primary-600)", fontWeight: 700 }}
          >
            Login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
