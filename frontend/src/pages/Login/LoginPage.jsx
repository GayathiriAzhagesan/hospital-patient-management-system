import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "../../components/layout/AuthLayout";
import { Lock, Mail, ArrowRight, UserCheck } from "lucide-react";

export const LoginPage = () => {
  const { login, authError } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success && res.user) {
      navigate(`/dashboard/${res.user.role.toLowerCase()}`);
    } else {
      setError(res.error || "Login failed. Please check credentials.");
    }
  };

  const fillDemoAccount = (demoEmail) => {
    setEmail(demoEmail);
    setPassword("Password123!");
    setError(null);
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to access your clinical dashboard & medical records"
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
          <label className="form-label">Email Address</label>
          <div style={{ position: "relative" }}>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. sarah.mitchell@medicare.health"
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
          style={{ width: "100%", marginTop: "12px", padding: "12px" }}
        >
          {loading ? "Authenticating..." : "Sign In to Portal"} <ArrowRight size={16} />
        </button>
      </form>

      {/* Recruiter / Evaluator Fast 1-Click Fillers */}
      <div
        style={{
          marginTop: "24px",
          padding: "16px",
          background: "var(--slate-50)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border-color)",
        }}
      >
        <span
          style={{
            fontSize: "0.6875rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "var(--slate-500)",
            display: "block",
            marginBottom: "8px",
          }}
        >
          Quick 1-Click Demo Personas:
        </span>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
          <button
            type="button"
            onClick={() => fillDemoAccount("sarah.mitchell@medicare.health")}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: "0.75rem" }}
          >
            🩺 Doctor
          </button>
          <button
            type="button"
            onClick={() => fillDemoAccount("james.rodriguez@email.com")}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: "0.75rem" }}
          >
            👤 Patient
          </button>
          <button
            type="button"
            onClick={() => fillDemoAccount("alex.chen@medicare.health")}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: "0.75rem" }}
          >
            💊 Pharmacist
          </button>
          <button
            type="button"
            onClick={() => fillDemoAccount("elena.rostova@medicare.health")}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: "0.75rem" }}
          >
            🛡️ Admin
          </button>
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: "24px" }}>
        <p style={{ fontSize: "0.875rem", color: "var(--slate-600)" }}>
          Don't have an account yet?{" "}
          <Link to="/register" style={{ color: "var(--primary-600)", fontWeight: 700 }}>
            Register New Account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
