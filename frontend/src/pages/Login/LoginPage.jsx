import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "../../components/layout/AuthLayout";
import {
  Lock,
  Mail,
  ArrowRight,
  UserCheck,
  Clock,
  XCircle,
  Stethoscope,
  Pill,
  ShieldCheck,
  User,
  AlertCircle,
} from "lucide-react";

export const LoginPage = () => {
  const { login, authError } = useAuth();
  const navigate = useNavigate();
  const { role: urlRole } = useParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);

  const getPortalInfo = () => {
    if (!urlRole) {
      return {
        title: "Welcome Back",
        subtitle: "Sign in to access your clinical dashboard & medical records",
        role: null,
      };
    }
    const lower = urlRole.toLowerCase();
    if (lower === "doctor") {
      return {
        title: "Doctor Portal Login",
        subtitle: "Authorized Physicians, Surgeons & Specialists",
        role: "Doctor",
      };
    }
    if (lower === "pharmacist") {
      return {
        title: "Pharmacist Portal Login",
        subtitle: "Authorized Hospital Pharmacy & Medicine Dispensary",
        role: "Pharmacist",
      };
    }
    if (lower === "patient") {
      return {
        title: "Patient Portal Login",
        subtitle: "Access personal health records, vitals & prescriptions",
        role: "Patient",
      };
    }
    if (lower === "admin") {
      return {
        title: "Administrator Portal Login",
        subtitle: "Hospital Operations, Staff Credentialing & Audit Command",
        role: "Admin",
      };
    }
    return {
      title: "Welcome Back",
      subtitle: "Sign in to access your clinical dashboard & medical records",
      role: null,
    };
  };

  const portalInfo = getPortalInfo();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorDetails(null);
    setLoading(true);

    const res = await login(email, password, portalInfo.role);
    setLoading(false);

    if (res.success && res.user) {
      navigate(`/dashboard/${res.user.role.toLowerCase()}`);
    } else {
      setErrorDetails({
        message: res.error || authError || "Login failed. Please check credentials.",
        status: res.status,
        rejectionReason: res.rejectionReason,
      });
    }
  };

  const currentErrorMessage = errorDetails?.message || authError;
  const isPending =
    errorDetails?.status === "pending" ||
    (currentErrorMessage &&
      (currentErrorMessage.toLowerCase().includes("waiting for admin approval") ||
        currentErrorMessage.toLowerCase().includes("awaiting administrator approval") ||
        currentErrorMessage.toLowerCase().includes("pending admin approval")));

  const isRejected =
    errorDetails?.status === "rejected" ||
    (currentErrorMessage &&
      (currentErrorMessage.toLowerCase().includes("rejected") ||
        currentErrorMessage.toLowerCase().includes("registration has been rejected")));

  return (
    <AuthLayout title={portalInfo.title} subtitle={portalInfo.subtitle}>
      {/* Role Indicator Badge if accessed via specific route */}
      {portalInfo.role && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px 12px",
            borderRadius: "9999px",
            fontSize: "0.75rem",
            fontWeight: 700,
            marginBottom: "16px",
            background:
              portalInfo.role === "Doctor"
                ? "#e0f2fe"
                : portalInfo.role === "Pharmacist"
                ? "#fae8ff"
                : portalInfo.role === "Admin"
                ? "#ecfdf5"
                : "#f1f5f9",
            color:
              portalInfo.role === "Doctor"
                ? "#0369a1"
                : portalInfo.role === "Pharmacist"
                ? "#a21caf"
                : portalInfo.role === "Admin"
                ? "#047857"
                : "#334155",
            border:
              portalInfo.role === "Doctor"
                ? "1px solid #bae6fd"
                : portalInfo.role === "Pharmacist"
                ? "1px solid #f5d0fe"
                : portalInfo.role === "Admin"
                ? "1px solid #a7f3d0"
                : "1px solid #e2e8f0",
          }}
        >
          {portalInfo.role === "Doctor" && <Stethoscope size={14} />}
          {portalInfo.role === "Pharmacist" && <Pill size={14} />}
          {portalInfo.role === "Admin" && <ShieldCheck size={14} />}
          {portalInfo.role === "Patient" && <User size={14} />}
          <span>{portalInfo.role} Access Mode</span>
        </div>
      )}

      {/* Error / Status Messages */}
      {currentErrorMessage && (
        <div
          style={{
            padding: "14px 16px",
            background: isPending ? "#fffbeb" : isRejected ? "#fef2f2" : "#fef2f2",
            border: `1px solid ${isPending ? "#fde68a" : isRejected ? "#fecdd3" : "#fecdd3"}`,
            borderRadius: "var(--radius-md)",
            color: isPending ? "#b45309" : isRejected ? "var(--rose-700)" : "var(--rose-600)",
            fontSize: "0.875rem",
            marginBottom: "20px",
            lineHeight: 1.5,
          }}
        >
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
            {isPending ? (
              <Clock size={18} color="#b45309" style={{ flexShrink: 0, marginTop: "2px" }} />
            ) : isRejected ? (
              <XCircle size={18} color="#be123c" style={{ flexShrink: 0, marginTop: "2px" }} />
            ) : (
              <AlertCircle size={18} color="#e11d48" style={{ flexShrink: 0, marginTop: "2px" }} />
            )}
            <div>
              <div style={{ fontWeight: 700 }}>{currentErrorMessage}</div>
              {isPending && (
                <div style={{ fontSize: "0.8125rem", marginTop: "4px", color: "#92400e" }}>
                  Your account registration has been submitted and is in the Administrator verification queue. Once approved, you can log in immediately.
                </div>
              )}
              {isRejected && errorDetails?.rejectionReason && (
                <div
                  style={{
                    marginTop: "6px",
                    padding: "6px 10px",
                    background: "rgba(255,255,255,0.7)",
                    borderRadius: "4px",
                    fontSize: "0.8125rem",
                    border: "1px solid #fecdd3",
                  }}
                >
                  <strong>Admin Note:</strong> {errorDetails.rejectionReason}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <div style={{ position: "relative" }}>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={
                portalInfo.role === "Doctor"
                  ? "doctor@medicare.health"
                  : portalInfo.role === "Pharmacist"
                  ? "pharmacist@medicare.health"
                  : "e.g. user@medicare.health"
              }
              required
            />
          </div>
        </div>

        <div className="form-group">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label className="form-label">Password</label>
            <span style={{ fontSize: "0.75rem", color: "var(--primary-600)", cursor: "pointer" }}>
              Forgot?
            </span>
          </div>
          <div style={{ position: "relative" }}>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
          style={{ width: "100%", marginTop: "14px", padding: "12px" }}
        >
          {loading
            ? "Authenticating..."
            : portalInfo.role
            ? `Login to ${portalInfo.role} Portal`
            : "Login to Portal"}{" "}
          <ArrowRight size={16} />
        </button>
      </form>

      {/* Role Navigation Quick Links if on general login */}
      {!urlRole && (
        <div
          style={{
            marginTop: "20px",
            paddingTop: "16px",
            borderTop: "1px solid var(--border-color)",
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: "0.75rem", color: "var(--slate-500)", fontWeight: 600 }}>
            Direct Portal Logins:
          </span>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "12px",
              marginTop: "8px",
              flexWrap: "wrap",
            }}
          >
            <Link
              to="/login/doctor"
              style={{
                fontSize: "0.75rem",
                color: "var(--primary-700)",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontWeight: 600,
              }}
            >
              <Stethoscope size={12} /> Doctor
            </Link>
            <span style={{ color: "var(--slate-300)" }}>•</span>
            <Link
              to="/login/pharmacist"
              style={{
                fontSize: "0.75rem",
                color: "#a21caf",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontWeight: 600,
              }}
            >
              <Pill size={12} /> Pharmacist
            </Link>
            <span style={{ color: "var(--slate-300)" }}>•</span>
            <Link
              to="/login/admin"
              style={{
                fontSize: "0.75rem",
                color: "#047857",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontWeight: 600,
              }}
            >
              <ShieldCheck size={12} /> Admin
            </Link>
          </div>
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <p style={{ fontSize: "0.875rem", color: "var(--slate-600)" }}>
          Don't have an account yet?{" "}
          <Link
            to={
              portalInfo.role === "Doctor"
                ? "/register/doctor"
                : portalInfo.role === "Pharmacist"
                ? "/register/pharmacist"
                : "/register"
            }
            style={{ color: "var(--primary-600)", fontWeight: 700 }}
          >
            Register
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
