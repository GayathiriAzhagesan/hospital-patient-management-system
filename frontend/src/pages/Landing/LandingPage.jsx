import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  HeartPulse,
  ShieldCheck,
  Activity,
  Users,
  Stethoscope,
  Pill,
  ShieldAlert,
  ArrowRight,
  Database,
  Lock,
  Zap,
  CheckCircle2,
  Calendar,
  CreditCard,
} from "lucide-react";

export const LandingPage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const handleQuickLogin = async (email, role) => {
    const res = await login(email, "Password123!");
    if (res.success) {
      navigate(`/dashboard/${role.toLowerCase()}`);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", color: "var(--slate-900)" }}>
      {/* Navigation Header */}
      <header
        style={{
          borderBottom: "1px solid var(--border-color)",
          padding: "16px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(8px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, var(--primary-600), var(--primary-800))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              boxShadow: "0 4px 12px rgba(13, 148, 136, 0.3)",
            }}
          >
            <HeartPulse size={22} />
          </div>
          <span style={{ fontSize: "1.25rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
            Medicare<span style={{ color: "var(--primary-600)" }}>Portal</span>
          </span>
          <span
            style={{
              fontSize: "0.6875rem",
              background: "var(--primary-100)",
              color: "var(--primary-700)",
              padding: "2px 8px",
              borderRadius: "9999px",
              fontWeight: 700,
              marginLeft: "6px",
            }}
          >
            v2.0 Full-Stack
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {user ? (
            <Link
              to={`/dashboard/${user.role.toLowerCase()}`}
              className="btn btn-primary btn-sm"
            >
              Open {user.role} Dashboard <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register Portal <ArrowRight size={16} />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          padding: "72px 24px 60px 24px",
          maxWidth: "1200px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 14px",
            borderRadius: "9999px",
            background: "var(--primary-50)",
            border: "1px solid var(--primary-200)",
            color: "var(--primary-700)",
            fontSize: "0.8125rem",
            fontWeight: 600,
            marginBottom: "24px",
          }}
        >
          <ShieldCheck size={16} />
          Enterprise Healthcare Architecture • Role-Based Access Control
        </div>

        <h1
          style={{
            fontSize: "clamp(2.5rem, 5vw, 4rem)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1.15,
            color: "var(--slate-950)",
            marginBottom: "20px",
          }}
        >
          Streamlined Clinical Operations &{" "}
          <span
            style={{
              background: "linear-gradient(135deg, var(--primary-600) 0%, #0284c7 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Digital Healthcare Delivery
          </span>
        </h1>

        <p
          style={{
            fontSize: "1.125rem",
            color: "var(--slate-600)",
            maxWidth: "760px",
            margin: "0 auto 36px auto",
            lineHeight: 1.6,
          }}
        >
          A unified, production-ready platform designed to digitize patient records, automate
          consultation queues, manage prescription fulfillment, and coordinate hospital billing with
          cryptographic role-based authorization.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap", marginBottom: "48px" }}>
          <Link to="/register" className="btn btn-primary btn-lg">
            Get Started Free <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn btn-secondary btn-lg">
            Explore Demo Roles
          </Link>
        </div>

        {/* 1-Click Persona Evaluation Strip */}
        <div
          style={{
            background: "var(--slate-50)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-xl)",
            padding: "24px",
            maxWidth: "960px",
            margin: "0 auto 64px auto",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ marginBottom: "16px" }}>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--slate-400)",
              }}
            >
              1-Click Recruiter & Reviewer Quick-Access
            </span>
            <h4 style={{ fontSize: "1.125rem", fontWeight: 700, marginTop: "2px" }}>
              Test The System Across 4 Medical Roles
            </h4>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
            <button
              onClick={() => handleQuickLogin("sarah.mitchell@medicare.health", "Doctor")}
              className="card"
              style={{ padding: "16px", textAlign: "left", cursor: "pointer", background: "#ffffff" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <Stethoscope size={18} color="#0d9488" />
                <strong style={{ fontSize: "0.875rem" }}>Doctor Portal</strong>
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--slate-500)" }}>
                Dr. Sarah Mitchell (Chief of Cardiology)
              </p>
            </button>

            <button
              onClick={() => handleQuickLogin("james.rodriguez@email.com", "Patient")}
              className="card"
              style={{ padding: "16px", textAlign: "left", cursor: "pointer", background: "#ffffff" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <Users size={18} color="#6366f1" />
                <strong style={{ fontSize: "0.875rem" }}>Patient Portal</strong>
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--slate-500)" }}>
                James Rodriguez (EHR & Vitals)
              </p>
            </button>

            <button
              onClick={() => handleQuickLogin("alex.chen@medicare.health", "Pharmacist")}
              className="card"
              style={{ padding: "16px", textAlign: "left", cursor: "pointer", background: "#ffffff" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <Pill size={18} color="#d946ef" />
                <strong style={{ fontSize: "0.875rem" }}>Pharmacist Portal</strong>
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--slate-500)" }}>
                Alex Chen, PharmD (Dispensary)
              </p>
            </button>

            <button
              onClick={() => handleQuickLogin("elena.rostova@medicare.health", "Admin")}
              className="card"
              style={{ padding: "16px", textAlign: "left", cursor: "pointer", background: "#ffffff" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <ShieldAlert size={18} color="#f59e0b" />
                <strong style={{ fontSize: "0.875rem" }}>Admin Portal</strong>
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--slate-500)" }}>
                Elena Rostova (Operations & Billing)
              </p>
            </button>
          </div>
        </div>
      </section>

      {/* Feature Capabilities Grid */}
      <section style={{ padding: "64px 24px", background: "var(--slate-50)", borderTop: "1px solid var(--border-color)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: 800 }}>
              Engineered for Clinical Precision & Security
            </h2>
            <p style={{ color: "var(--slate-500)", marginTop: "8px", fontSize: "1rem" }}>
              Seamlessly integrates patient history, consultation queues, pharmacy dispensing, and financial workflows.
            </p>
          </div>

          <div className="grid-cols-3">
            <div className="card">
              <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                <Users size={20} />
              </div>
              <h3 style={{ fontSize: "1.125rem", marginBottom: "8px" }}>Role-Based Access Control</h3>
              <p style={{ fontSize: "0.875rem", color: "var(--slate-600)", lineHeight: 1.5 }}>
                Strict cryptographic authorization separating Patients, Doctors, Pharmacists, and Hospital Administrators with JWT tokens.
              </p>
            </div>

            <div className="card">
              <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "#f0fdfa", color: "#0d9488", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                <Activity size={20} />
              </div>
              <h3 style={{ fontSize: "1.125rem", marginBottom: "8px" }}>Electronic Health Records (EHR)</h3>
              <p style={{ fontSize: "0.875rem", color: "var(--slate-600)", lineHeight: 1.5 }}>
                Comprehensive medical history, vital signs telemetry (BP, HR, SpO2), allergies, and longitudinal patient health profiles.
              </p>
            </div>

            <div className="card">
              <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "#fdf4ff", color: "#a21caf", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                <Pill size={20} />
              </div>
              <h3 style={{ fontSize: "1.125rem", marginBottom: "8px" }}>Prescription & Pharmacy Queue</h3>
              <p style={{ fontSize: "0.875rem", color: "var(--slate-600)", lineHeight: 1.5 }}>
                Digital prescription issuance by certified physicians with real-time verification and dispensing status updates by pharmacists.
              </p>
            </div>

            <div className="card">
              <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "#fffbeb", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                <Calendar size={20} />
              </div>
              <h3 style={{ fontSize: "1.125rem", marginBottom: "8px" }}>Real-Time Appointments</h3>
              <p style={{ fontSize: "0.875rem", color: "var(--slate-600)", lineHeight: 1.5 }}>
                Patient appointment booking with specialist selection, status progression (Scheduled, In-Progress, Completed), and calendar filters.
              </p>
            </div>

            <div className="card">
              <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "#ecfdf5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                <CreditCard size={20} />
              </div>
              <h3 style={{ fontSize: "1.125rem", marginBottom: "8px" }}>Hospital Billing & Invoices</h3>
              <p style={{ fontSize: "0.875rem", color: "var(--slate-600)", lineHeight: 1.5 }}>
                Itemized invoice generation, insurance claim association, payment tracking, and one-click financial settlements.
              </p>
            </div>

            <div className="card">
              <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "#fef2f2", color: "#e11d48", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                <Database size={20} />
              </div>
              <h3 style={{ fontSize: "1.125rem", marginBottom: "8px" }}>MongoDB Atlas & Node REST API</h3>
              <p style={{ fontSize: "0.875rem", color: "var(--slate-600)", lineHeight: 1.5 }}>
                Decoupled backend powered by Express and Mongoose schemas, ready for high-concurrency cloud deployments on Render & Vercel.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--border-color)",
          padding: "40px 24px",
          background: "#ffffff",
          textAlign: "center",
          color: "var(--slate-500)",
          fontSize: "0.875rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "12px" }}>
          <HeartPulse size={18} color="var(--primary-600)" />
          <strong style={{ color: "var(--slate-900)" }}>Medicare Portal Full-Stack System</strong>
        </div>
        <p>Built with React.js, Express.js, MongoDB Atlas, and JWT Authentication.</p>
        <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "16px" }}>
          <Link to="/login" style={{ color: "var(--primary-700)", fontWeight: 600 }}>Login</Link>
          <Link to="/register" style={{ color: "var(--primary-700)", fontWeight: 600 }}>Register</Link>
          <Link to="/appointments" style={{ color: "var(--primary-700)", fontWeight: 600 }}>Appointments</Link>
          <Link to="/billing" style={{ color: "var(--primary-700)", fontWeight: 600 }}>Billing</Link>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
