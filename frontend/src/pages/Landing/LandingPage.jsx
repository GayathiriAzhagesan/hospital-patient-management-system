import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/common/Sidebar";
import {
  HeartPulse,
  ShieldCheck,
  Activity,
  Users,
  Stethoscope,
  Pill,
  ArrowRight,
  Database,
  Lock,
  Zap,
  CheckCircle2,
  Calendar,
  CreditCard,
  Star,
  Award,
  Phone,
  Clock,
  Sparkles,
  Baby,
  FileText,
  Check,
  ChevronRight,
  Building2,
  ShieldAlert,
  Hospital,
} from "lucide-react";

export const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const doctorsDirectory = [
    {
      id: "doc-1",
      name: "Dr. Priya Ramanathan, MD",
      specialty: "Cardiology",
      experience: "15+ Years Exp",
      hospital: "Apollo & Johns Hopkins Fellow",
      rating: "4.9",
      reviews: "940+",
      availability: "Available Today",
      room: "Room 304 • Cardiac Wing",
      image:
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&auto=format&fit=crop&q=80",
    },
    {
      id: "doc-2",
      name: "Dr. Rajesh Sharma, MD, DCH",
      specialty: "Pediatrics & Neonatal Care",
      experience: "12+ Years Exp",
      hospital: "Senior Pediatric Lead",
      rating: "5.0",
      reviews: "1,150+",
      availability: "In Clinic Now",
      room: "Room 108 • Child Health Pavilion",
      image:
        "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600&auto=format&fit=crop&q=80",
    },
    {
      id: "doc-3",
      name: "Dr. Elena Rostova, MD, PhD",
      specialty: "Neurology & Brain Spine",
      experience: "16+ Years Exp",
      hospital: "Neuro-Telemetry Specialist",
      rating: "4.9",
      reviews: "820+",
      availability: "Available Today",
      room: "Room 412 • Neurosciences Wing",
      image:
        "https://images.unsplash.com/photo-1594824813689-53e344e27f4d?w=600&auto=format&fit=crop&q=80",
    },
    {
      id: "doc-4",
      name: "Dr. Marcus Vance, MS (Ortho)",
      specialty: "Orthopedic & Joint Care",
      experience: "14+ Years Exp",
      hospital: "Robotic Joint Replacement",
      rating: "4.8",
      reviews: "890+",
      availability: "Available Tomorrow",
      room: "Room 205 • Orthopedic Suite",
      image:
        "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&auto=format&fit=crop&q=80",
    },
  ];

  const healthcareServices = [
    {
      icon: Users,
      title: "Patient Management & EHR",
      description:
        "Longitudinal medical histories, continuous vital signs telemetry (BP, Heart Rate, SpO2), allergy registers, and family health logs.",
      accent: "#0284c7",
      bg: "#e0f2fe",
      badge: "Clinical Standard",
    },
    {
      icon: Calendar,
      title: "Appointment Scheduling",
      description:
        "Real-time consultation queues, doctor roster availability, instant digital triage, and multi-department slot management.",
      accent: "#0d9488",
      bg: "#ccfbf1",
      badge: "Zero Wait Time",
    },
    {
      icon: FileText,
      title: "Electronic Medical Records",
      description:
        "Encrypted diagnostic imaging reports, physician consultation notes, clinical laboratory telemetry, and lifetime patient archives.",
      accent: "#4f46e5",
      bg: "#e0e7ff",
      badge: "Encrypted & Compliant",
    },
    {
      icon: CreditCard,
      title: "Billing & Invoices",
      description:
        "Itemized hospital billing in Indian Rupees (₹), insurance claims coordination, instant receipt generation, and settlement audits.",
      accent: "#059669",
      bg: "#d1fae5",
      badge: "Real-Time Clearances",
    },
    {
      icon: Pill,
      title: "Pharmacy Management",
      description:
        "Digital doctor prescription issuance, pharmacist dosage cross-verification, automated medicine dispensing logs, and inventory safeguards.",
      accent: "#a21caf",
      bg: "#fae8ff",
      badge: "Safety Verified",
    },
    {
      icon: Lock,
      title: "Secure Healthcare Access",
      description:
        "Multi-tier Role-Based Access Control (RBAC) isolating Patient, Doctor, Pharmacist, and Hospital Administrator privileges with 256-bit JWT.",
      accent: "#d97706",
      bg: "#fef3c7",
      badge: "Cryptographic RBAC",
    },
  ];

  const filteredDoctors =
    selectedSpecialty === "All"
      ? doctorsDirectory
      : doctorsDirectory.filter((doc) => doc.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase()));

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", color: "var(--slate-900)", overflowX: "hidden" }}>
      {/* Top Clinical Notification Ribbon */}
      <div
        style={{
          background: "linear-gradient(90deg, #0f172a 0%, #0369a1 50%, #0d9488 100%)",
          color: "#ffffff",
          padding: "8px 24px",
          fontSize: "0.8125rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "0 auto" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              background: "rgba(255, 255, 255, 0.2)",
              padding: "2px 8px",
              borderRadius: "9999px",
              fontSize: "0.75rem",
              fontWeight: 700,
            }}
          >
            <Sparkles size={12} /> 24/7 Digital Health
          </span>
          <span>Emergency Clinical Helpline & Consultations: <strong>1800-MEDICARE</strong> (Toll Free)</span>
        </div>
      </div>

      {/* Off-canvas Healthcare Navigation Drawer (Hidden by default) */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Navigation Header */}
      <header
        style={{
          borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
          padding: "16px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "0 2px 8px -2px rgba(15, 23, 42, 0.05)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* 3-line Hamburger Menu Icon (☰) - Toggles Healthcare Navigation */}
          <button
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "40px",
              color: isSidebarOpen ? "var(--primary-600)" : "var(--slate-700)",
              background: isSidebarOpen ? "var(--primary-50)" : "#ffffff",
              border: "1px solid",
              borderColor: isSidebarOpen ? "var(--primary-300)" : "var(--border-color)",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              transition: "all var(--transition-fast)",
              padding: 0,
            }}
            aria-label={isSidebarOpen ? "Close Healthcare Navigation" : "Open Healthcare Navigation"}
            title={isSidebarOpen ? "Close Menu" : "Healthcare Navigation (☰)"}
            id="healthcare-hamburger-btn"
          >
            {/* 3-line hamburger menu icon (☰) */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3.5" y1="6" x2="20.5" y2="6" />
              <line x1="3.5" y1="12" x2="20.5" y2="12" />
              <line x1="3.5" y1="18" x2="20.5" y2="18" />
            </svg>
          </button>

          {/* Brand Logo */}
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #0284c7 0%, #0d9488 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              boxShadow: "0 6px 16px rgba(2, 132, 199, 0.3)",
            }}
          >
            <HeartPulse size={24} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--slate-950)", letterSpacing: "-0.03em" }}>
                Medicare<span style={{ color: "#0284c7" }}>Portal</span>
              </span>
              <span
                style={{
                  fontSize: "0.6875rem",
                  background: "#e0f2fe",
                  color: "#0369a1",
                  padding: "2px 8px",
                  borderRadius: "9999px",
                  fontWeight: 700,
                }}
              >
                Hospital Standard
              </span>
            </div>
            <p style={{ fontSize: "0.6875rem", color: "var(--slate-500)", margin: 0, fontWeight: 500 }}>
              Hospital & Patient Management Network
            </p>
          </div>
        </Link>
        </div>

        {/* Quick Nav Anchors */}
        <nav style={{ display: "none", alignItems: "center", gap: "28px" }} className="desktop-nav">
          <a href="#specialists" style={{ color: "var(--slate-600)", fontWeight: 600, fontSize: "0.875rem" }}>
            Specialists
          </a>
          <a href="#pediatric-care" style={{ color: "var(--slate-600)", fontWeight: 600, fontSize: "0.875rem" }}>
            Pediatric Center
          </a>
          <a href="#services" style={{ color: "var(--slate-600)", fontWeight: 600, fontSize: "0.875rem" }}>
            Clinical Services
          </a>
          <a href="#security" style={{ color: "var(--slate-600)", fontWeight: 600, fontSize: "0.875rem" }}>
            Security & Compliance
          </a>
        </nav>

        {/* Authentication Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {user ? (
            <Link
              to={`/dashboard/${user.role.toLowerCase()}`}
              className="btn btn-primary"
              style={{
                background: "linear-gradient(135deg, #0284c7, #0369a1)",
                padding: "9px 18px",
              }}
            >
              Open {user.role} Portal <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="btn btn-secondary"
                style={{
                  borderColor: "#cbd5e1",
                  padding: "9px 18px",
                  fontWeight: 600,
                }}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="btn btn-primary"
                style={{
                  background: "linear-gradient(135deg, #0284c7 0%, #0d9488 100%)",
                  boxShadow: "0 4px 14px rgba(2, 132, 199, 0.35)",
                  padding: "9px 20px",
                }}
              >
                Register <ArrowRight size={16} />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* =========================================================================
          HERO SECTION: Modern Healthcare Management Platform
          ========================================================================= */}
      <section
        className="bg-medical-mesh"
        style={{
          padding: "60px 24px 80px 24px",
          position: "relative",
          overflow: "hidden",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        {/* Subtle Decorative Floating Medical Crosses */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "5%",
            color: "rgba(2, 132, 199, 0.12)",
            fontSize: "3rem",
            fontWeight: 900,
            userSelect: "none",
            pointerEvents: "none",
          }}
          className="animate-float"
        >
          ✚
        </div>
        <div
          style={{
            position: "absolute",
            top: "60%",
            left: "3%",
            color: "rgba(13, 148, 136, 0.1)",
            fontSize: "2.5rem",
            fontWeight: 900,
            userSelect: "none",
            pointerEvents: "none",
          }}
          className="animate-float-delayed"
        >
          ✚
        </div>
        <div
          style={{
            position: "absolute",
            top: "20%",
            right: "4%",
            color: "rgba(2, 132, 199, 0.15)",
            fontSize: "3.5rem",
            fontWeight: 900,
            userSelect: "none",
            pointerEvents: "none",
          }}
          className="animate-float"
        >
          ✚
        </div>

        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1.1fr 1fr",
            gap: "48px",
            alignItems: "center",
          }}
          className="hero-grid"
        >
          {/* Left Column: Clinical Positioning & CTAs */}
          <div>
            {/* Accreditation Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 14px",
                borderRadius: "9999px",
                background: "#f0f9ff",
                border: "1px solid #bae6fd",
                color: "#0369a1",
                fontSize: "0.8125rem",
                fontWeight: 700,
                marginBottom: "20px",
              }}
            >
              <ShieldCheck size={16} color="#0284c7" />
              NABH & JCI Hospital Standards • Verified Role-Based Security
            </div>

            {/* Main Headline */}
            <h1
              style={{
                fontSize: "clamp(2.5rem, 4.2vw, 3.8rem)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
                color: "var(--slate-950)",
                marginBottom: "20px",
              }}
            >
              Modern Healthcare{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #0284c7 0%, #0d9488 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Management Platform
              </span>
            </h1>

            {/* Supporting Text */}
            <p
              style={{
                fontSize: "1.125rem",
                color: "var(--slate-600)",
                lineHeight: 1.65,
                marginBottom: "32px",
                maxWidth: "600px",
              }}
            >
              Digitize comprehensive patient EHR records, coordinate seamless specialist consultations,
              automate pharmacy dispensing queues, and streamline hospital billing with enterprise cryptographic
              role authorization.
            </p>

            {/* Primary Action Buttons */}
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "36px" }}>
              <Link
                to="/register"
                className="btn btn-primary btn-lg"
                style={{
                  background: "linear-gradient(135deg, #0284c7 0%, #0d9488 100%)",
                  boxShadow: "0 8px 24px rgba(2, 132, 199, 0.35)",
                  padding: "14px 32px",
                  fontSize: "1.05rem",
                }}
              >
                Register <ArrowRight size={18} />
              </Link>
              <Link
                to="/login"
                className="btn btn-secondary btn-lg"
                style={{
                  borderColor: "#cbd5e1",
                  padding: "14px 30px",
                  fontSize: "1.05rem",
                  color: "var(--slate-800)",
                }}
              >
                Login
              </Link>
            </div>

            {/* Trust Micro-Bullets */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                flexWrap: "wrap",
                fontSize: "0.8125rem",
                color: "var(--slate-500)",
                fontWeight: 600,
                borderTop: "1px solid var(--border-color)",
                paddingTop: "24px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <CheckCircle2 size={16} color="#0d9488" /> 256-Bit JWT Encryption
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <CheckCircle2 size={16} color="#0d9488" /> Real-Time MongoDB Atlas Sync
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <CheckCircle2 size={16} color="#0d9488" /> Instant Specialist Triage
              </div>
            </div>
          </div>

          {/* Right Column: Visual Composition with Floating Clinical UI */}
          <div style={{ position: "relative" }}>
            {/* Ambient Backlight Glow */}
            <div
              style={{
                position: "absolute",
                top: "15%",
                left: "15%",
                width: "70%",
                height: "70%",
                background: "radial-gradient(circle, rgba(2, 132, 199, 0.25) 0%, rgba(13, 148, 136, 0.15) 100%)",
                filter: "blur(60px)",
                borderRadius: "50%",
                zIndex: 0,
              }}
            />

            {/* Main Visual Frame */}
            <div
              style={{
                position: "relative",
                zIndex: 1,
                borderRadius: "24px",
                overflow: "hidden",
                border: "4px solid #ffffff",
                boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.18)",
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=900&auto=format&fit=crop&q=80"
                alt="Compassionate healthcare doctor and patient consultation"
                style={{
                  width: "100%",
                  height: "460px",
                  objectFit: "cover",
                  display: "block",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(15, 23, 42, 0.7) 0%, rgba(15, 23, 42, 0) 50%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "20px",
                  left: "24px",
                  right: "24px",
                  color: "#ffffff",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#10b981",
                      display: "inline-block",
                    }}
                  />
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    Live Consultation Queue
                  </span>
                </div>
                <h4 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                  Dr. Sarah Jenkins • Clinical Cardiology Lead
                </h4>
              </div>
            </div>

            {/* Floating Element 1: Heartbeat / ECG Live Card */}
            <div
              className="glass-badge animate-float"
              style={{
                position: "absolute",
                top: "-16px",
                left: "-20px",
                zIndex: 2,
                borderRadius: "16px",
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                minWidth: "220px",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "10px",
                  background: "#e0f2fe",
                  color: "#0284c7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Activity size={22} />
              </div>
              <div>
                <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--slate-500)", textTransform: "uppercase" }}>
                  Vital Telemetry
                </div>
                <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--slate-900)" }}>
                  Normal Sinus 72 BPM
                </div>
                <div style={{ fontSize: "0.6875rem", color: "#059669", fontWeight: 600 }}>
                  ● SpO2 99% • Blood Pressure 120/80
                </div>
              </div>
            </div>

            {/* Floating Element 2: Doctor Experience & Rating Card */}
            <div
              className="glass-badge animate-float-delayed"
              style={{
                position: "absolute",
                bottom: "-24px",
                right: "-20px",
                zIndex: 2,
                borderRadius: "16px",
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                minWidth: "240px",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: "#d1fae5",
                  color: "#059669",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Award size={24} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Star size={14} fill="#f59e0b" color="#f59e0b" />
                  <span style={{ fontWeight: 800, fontSize: "0.9375rem" }}>4.95 / 5.0</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--slate-500)" }}>(3,500+ Reviews)</span>
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--slate-600)", fontWeight: 600, marginTop: "2px" }}>
                  99.8% Patient Satisfaction
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          KEY HOSPITAL METRICS STRIP
          ========================================================================= */}
      <section style={{ background: "#f8fafc", borderBottom: "1px solid var(--border-color)", padding: "36px 24px" }}>
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "28px",
            textAlign: "center",
          }}
        >
          <div>
            <div style={{ fontSize: "2.25rem", fontWeight: 800, color: "#0284c7" }}>50,000+</div>
            <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--slate-700)", marginTop: "4px" }}>
              Consultations Scheduled
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--slate-400)" }}>Across outpatient & inpatient clinics</div>
          </div>

          <div>
            <div style={{ fontSize: "2.25rem", fontWeight: 800, color: "#0d9488" }}>150+</div>
            <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--slate-700)", marginTop: "4px" }}>
              Specialists & Physicians
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--slate-400)" }}>Board-certified medical practitioners</div>
          </div>

          <div>
            <div style={{ fontSize: "2.25rem", fontWeight: 800, color: "#4f46e5" }}>99.8%</div>
            <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--slate-700)", marginTop: "4px" }}>
              Clinical Precision Rate
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--slate-400)" }}>Verified diagnostic & dosage logs</div>
          </div>

          <div>
            <div style={{ fontSize: "2.25rem", fontWeight: 800, color: "#d97706" }}>24/7</div>
            <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--slate-700)", marginTop: "4px" }}>
              EHR Cloud Availability
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--slate-400)" }}>High-availability MongoDB Atlas</div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SPECIALIZED PEDIATRIC & FAMILY CARE SPOTLIGHT
          ========================================================================= */}
      <section
        id="pediatric-care"
        style={{
          padding: "80px 24px",
          background: "linear-gradient(180deg, #ffffff 0%, #f0fdfa 100%)",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <div
          style={{
            maxWidth: "1240px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1.1fr",
            gap: "56px",
            alignItems: "center",
          }}
          className="hero-grid"
        >
          {/* Pediatric Visual with Floating Badge */}
          <div style={{ position: "relative" }}>
            <div
              style={{
                borderRadius: "24px",
                overflow: "hidden",
                boxShadow: "0 20px 40px -10px rgba(13, 148, 136, 0.18)",
                border: "4px solid #ffffff",
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80"
                alt="Pediatrician gently examining child patient with stethoscope"
                style={{
                  width: "100%",
                  height: "440px",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>

            {/* Pediatric Center Floating Badge */}
            <div
              className="glass-badge animate-float"
              style={{
                position: "absolute",
                bottom: "-16px",
                left: "-16px",
                borderRadius: "16px",
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "10px",
                  background: "#fdf4ff",
                  color: "#a21caf",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Baby size={22} />
              </div>
              <div>
                <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--slate-900)" }}>
                  Specialized Pediatric Ward
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--slate-500)" }}>
                  Infant Neonatal Care & Child Wellness
                </div>
              </div>
            </div>
          </div>

          {/* Pediatric Care Content */}
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 12px",
                borderRadius: "9999px",
                background: "#ccfbf1",
                color: "#0f766e",
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "16px",
              }}
            >
              <Baby size={14} /> Comprehensive Pediatric Excellence
            </div>

            <h2
              style={{
                fontSize: "clamp(2rem, 3.5vw, 2.75rem)",
                fontWeight: 800,
                color: "var(--slate-950)",
                lineHeight: 1.2,
                marginBottom: "20px",
              }}
            >
              Compassionate Healthcare for Infants, Children & Families
            </h2>

            <p
              style={{
                fontSize: "1.0625rem",
                color: "var(--slate-600)",
                lineHeight: 1.65,
                marginBottom: "28px",
              }}
            >
              Our pediatric department integrates warm bedside compassion with precision clinical tracking.
              From neonatal health screenings to immunization schedules and developmental milestones, Medicare Portal
              empowers pediatricians and parents with unified records.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "32px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <div style={{ color: "#0d9488", marginTop: "2px" }}>
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--slate-900)" }}>
                    Vaccination & Milestone Tracking
                  </h4>
                  <p style={{ fontSize: "0.8125rem", color: "var(--slate-500)", marginTop: "2px" }}>
                    Automated immunization schedules and growth percentiles.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <div style={{ color: "#0d9488", marginTop: "2px" }}>
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--slate-900)" }}>
                    24/7 Neonatal Readiness
                  </h4>
                  <p style={{ fontSize: "0.8125rem", color: "var(--slate-500)", marginTop: "2px" }}>
                    Immediate specialist consultation for urgent infant cases.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <div style={{ color: "#0d9488", marginTop: "2px" }}>
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--slate-900)" }}>
                    Child-Friendly Environments
                  </h4>
                  <p style={{ fontSize: "0.8125rem", color: "var(--slate-500)", marginTop: "2px" }}>
                    Trained nurses providing anxiety-free consultation visits.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <div style={{ color: "#0d9488", marginTop: "2px" }}>
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--slate-900)" }}>
                    Digital Prescription Records
                  </h4>
                  <p style={{ fontSize: "0.8125rem", color: "var(--slate-500)", marginTop: "2px" }}>
                    Exact age-adjusted dosages verified by certified pharmacists.
                  </p>
                </div>
              </div>
            </div>

            <Link
              to="/register"
              className="btn btn-primary"
              style={{
                background: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)",
                boxShadow: "0 4px 14px rgba(13, 148, 136, 0.3)",
              }}
            >
              Book Pediatric Appointment <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          DOCTORS DIRECTORY PREVIEW: Meet Our Clinical Specialists
          ========================================================================= */}
      <section
        id="specialists"
        style={{
          padding: "80px 24px",
          background: "#ffffff",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 12px",
                borderRadius: "9999px",
                background: "#e0f2fe",
                color: "#0284c7",
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "12px",
              }}
            >
              <Stethoscope size={14} /> Clinical Faculty & Specialists
            </div>
            <h2
              style={{
                fontSize: "clamp(2rem, 3.5vw, 2.5rem)",
                fontWeight: 800,
                color: "var(--slate-950)",
              }}
            >
              Consult With Leading Medical Specialists
            </h2>
            <p
              style={{
                color: "var(--slate-500)",
                marginTop: "8px",
                fontSize: "1.0625rem",
                maxWidth: "680px",
                margin: "8px auto 0 auto",
              }}
            >
              Access certified specialists across Cardiology, Pediatrics, Neurology, and Orthopedic surgery
              with live scheduling and verified patient ratings.
            </p>

            {/* Department Filter Tabs */}
            <div
              style={{
                display: "inline-flex",
                background: "var(--slate-100)",
                padding: "4px",
                borderRadius: "9999px",
                marginTop: "28px",
                gap: "4px",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {["All", "Cardiology", "Pediatrics", "Neurology", "Orthopedic"].map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedSpecialty(dept)}
                  style={{
                    padding: "8px 20px",
                    borderRadius: "9999px",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    background: selectedSpecialty === dept ? "#ffffff" : "transparent",
                    color: selectedSpecialty === dept ? "#0284c7" : "var(--slate-600)",
                    boxShadow: selectedSpecialty === dept ? "var(--shadow-sm)" : "none",
                    cursor: "pointer",
                    transition: "all var(--transition-fast)",
                  }}
                >
                  {dept === "All" ? "All Departments" : dept}
                </button>
              ))}
            </div>
          </div>

          {/* Doctors Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "28px",
            }}
          >
            {filteredDoctors.map((doc) => (
              <div
                key={doc.id}
                className="doctor-card"
                style={{
                  borderRadius: "20px",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Image Container with Badge */}
                <div style={{ position: "relative", height: "260px", overflow: "hidden" }}>
                  <img
                    src={doc.image}
                    alt={doc.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                      transition: "transform 0.4s ease",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "14px",
                      right: "14px",
                      background: "rgba(255, 255, 255, 0.95)",
                      backdropFilter: "blur(8px)",
                      borderRadius: "9999px",
                      padding: "4px 10px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "var(--slate-800)",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <Star size={13} fill="#f59e0b" color="#f59e0b" />
                    <span>{doc.rating}</span>
                    <span style={{ color: "var(--slate-400)", fontWeight: 500 }}>({doc.reviews})</span>
                  </div>

                  <div
                    style={{
                      position: "absolute",
                      bottom: "14px",
                      left: "14px",
                      background: "rgba(15, 23, 42, 0.85)",
                      backdropFilter: "blur(6px)",
                      color: "#ffffff",
                      borderRadius: "6px",
                      padding: "3px 8px",
                      fontSize: "0.6875rem",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981" }} />
                    {doc.availability}
                  </div>
                </div>

                {/* Doctor Bio Details */}
                <div style={{ padding: "20px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0284c7", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {doc.specialty}
                  </div>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--slate-900)", marginTop: "4px" }}>
                    {doc.name}
                  </h3>
                  <p style={{ fontSize: "0.8125rem", color: "var(--slate-500)", marginTop: "2px" }}>
                    {doc.hospital} • {doc.experience}
                  </p>

                  <div
                    style={{
                      marginTop: "14px",
                      paddingTop: "14px",
                      borderTop: "1px solid var(--border-color)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={{ fontSize: "0.75rem", color: "var(--slate-500)", fontWeight: 500 }}>
                      {doc.room}
                    </span>
                    <Link
                      to="/register"
                      className="btn btn-sm"
                      style={{
                        background: "#e0f2fe",
                        color: "#0369a1",
                        fontWeight: 700,
                        gap: "4px",
                      }}
                    >
                      Consult <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          HEALTHCARE SERVICES & CLINICAL MODULES GRID
          ========================================================================= */}
      <section
        id="services"
        style={{
          padding: "80px 24px",
          background: "var(--slate-50)",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "52px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 12px",
                borderRadius: "9999px",
                background: "#ccfbf1",
                color: "#0f766e",
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "12px",
              }}
            >
              <Building2 size={14} /> Enterprise Hospital Infrastructure
            </div>
            <h2
              style={{
                fontSize: "clamp(2rem, 3.5vw, 2.5rem)",
                fontWeight: 800,
                color: "var(--slate-950)",
              }}
            >
              Full-Spectrum Digital Healthcare Capabilities
            </h2>
            <p
              style={{
                color: "var(--slate-500)",
                marginTop: "8px",
                fontSize: "1.0625rem",
                maxWidth: "700px",
                margin: "8px auto 0 auto",
              }}
            >
              Designed for high-throughput clinical networks, connecting every stakeholder—from the outpatient desk
              to physician consultation suites and certified dispensary pharmacies.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "24px",
            }}
          >
            {healthcareServices.map((service, idx) => {
              const Icon = service.icon;
              return (
                <div
                  key={idx}
                  className="service-card card"
                  style={{
                    padding: "28px",
                    borderRadius: "20px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "12px",
                        background: service.bg,
                        color: service.accent,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon size={24} />
                    </div>
                    <span
                      style={{
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        padding: "3px 10px",
                        borderRadius: "9999px",
                        background: "var(--slate-100)",
                        color: "var(--slate-600)",
                      }}
                    >
                      {service.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--slate-900)", marginBottom: "10px" }}>
                    {service.title}
                  </h3>
                  <p style={{ fontSize: "0.875rem", color: "var(--slate-600)", lineHeight: 1.6, flexGrow: 1 }}>
                    {service.description}
                  </p>

                  <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid var(--border-color)" }}>
                    <Link
                      to="/register"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "0.8125rem",
                        fontWeight: 700,
                        color: service.accent,
                      }}
                    >
                      Explore Service <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          HOSPITAL ENVIRONMENT & INFRASTRUCTURE SHOWCASE
          ========================================================================= */}
      <section
        style={{
          padding: "80px 24px",
          background: "#ffffff",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.1fr 1fr",
              gap: "48px",
              alignItems: "center",
            }}
            className="hero-grid"
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 12px",
                  borderRadius: "9999px",
                  background: "#e0f2fe",
                  color: "#0284c7",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "16px",
                }}
              >
                <Hospital size={14} /> Integrated Modern Facility
              </div>
              <h2
                style={{
                  fontSize: "clamp(2rem, 3.5vw, 2.6rem)",
                  fontWeight: 800,
                  color: "var(--slate-950)",
                  lineHeight: 1.2,
                  marginBottom: "20px",
                }}
              >
                Built for High-Velocity Hospital Environments
              </h2>
              <p
                style={{
                  fontSize: "1.0625rem",
                  color: "var(--slate-600)",
                  lineHeight: 1.65,
                  marginBottom: "24px",
                }}
              >
                From ICU wards to outpatient clinics, Medicare Portal synchronizes diagnostic orders,
                physician clinical notes, bed occupancy, and medication logs with zero data latency.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "32px" }}>
                {[
                  "Paperless clinical triage with instant EHR telemetry",
                  "Automated doctor consultation queues and emergency paging",
                  "Verified barcode & dosage verification for pharmaceutical safety",
                  "Transparent billing statements in Indian Rupees (₹) with instant receipts",
                ].map((point, index) => (
                  <div key={index} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        background: "#e0f2fe",
                        color: "#0284c7",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Check size={14} />
                    </div>
                    <span style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--slate-800)" }}>
                      {point}
                    </span>
                  </div>
                ))}
              </div>

              <Link
                to="/register"
                className="btn btn-primary"
                style={{
                  background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                  boxShadow: "0 4px 14px rgba(2, 132, 199, 0.35)",
                }}
              >
                Get Started Today <ArrowRight size={16} />
              </Link>
            </div>

            {/* Hospital Environment Imagery Mosaic */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div
                  style={{
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&auto=format&fit=crop&q=80"
                    alt="Modern hospital corridor and clinical environment"
                    style={{ width: "100%", height: "230px", objectFit: "cover", display: "block" }}
                  />
                </div>
                <div
                  style={{
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&auto=format&fit=crop&q=80"
                    alt="Doctor reviewing digital medical EHR on tablet"
                    style={{ width: "100%", height: "180px", objectFit: "cover", display: "block" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "24px" }}>
                <div
                  style={{
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80"
                    alt="Pediatrician consultation in pediatric care suite"
                    style={{ width: "100%", height: "180px", objectFit: "cover", display: "block" }}
                  />
                </div>
                <div
                  style={{
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600&auto=format&fit=crop&q=80"
                    alt="Physician in clinic consultation room"
                    style={{ width: "100%", height: "230px", objectFit: "cover", display: "block" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECURITY & TRUST INDICATORS SECTION
          ========================================================================= */}
      <section
        id="security"
        style={{
          padding: "72px 24px",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "#ffffff",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 14px",
                borderRadius: "9999px",
                background: "rgba(2, 132, 199, 0.2)",
                color: "#38bdf8",
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: "12px",
              }}
            >
              <Lock size={13} /> Enterprise Security Protocol
            </div>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#ffffff" }}>
              Engineered with Cryptographic Role Isolation
            </h2>
            <p style={{ color: "var(--slate-400)", maxWidth: "660px", margin: "8px auto 0 auto", fontSize: "1rem" }}>
              Protecting confidential health information through end-to-end access boundaries and rigorous compliance.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "24px",
            }}
          >
            <div
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "16px",
                padding: "24px",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "10px",
                  background: "rgba(2, 132, 199, 0.2)",
                  color: "#38bdf8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                }}
              >
                <Lock size={22} />
              </div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#ffffff", marginBottom: "8px" }}>
                Secure Authentication
              </h3>
              <p style={{ fontSize: "0.875rem", color: "var(--slate-400)", lineHeight: 1.5 }}>
                JSON Web Tokens (JWT) signed with 256-bit cryptography and bcrypt salted password hashing for impenetrable user identity.
              </p>
            </div>

            <div
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "16px",
                padding: "24px",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "10px",
                  background: "rgba(13, 148, 136, 0.2)",
                  color: "#2dd4bf",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                }}
              >
                <ShieldCheck size={22} />
              </div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#ffffff", marginBottom: "8px" }}>
                Role-Based Access Control
              </h3>
              <p style={{ fontSize: "0.875rem", color: "var(--slate-400)", lineHeight: 1.5 }}>
                Strict RBAC guarantees Patients, Doctors, Pharmacists, and Administrators can only query their authorized medical data.
              </p>
            </div>

            <div
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "16px",
                padding: "24px",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "10px",
                  background: "rgba(99, 102, 241, 0.2)",
                  color: "#818cf8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                }}
              >
                <Database size={22} />
              </div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#ffffff", marginBottom: "8px" }}>
                Cloud Database Resiliency
              </h3>
              <p style={{ fontSize: "0.875rem", color: "var(--slate-400)", lineHeight: 1.5 }}>
                Fully decoupled MongoDB Atlas infrastructure delivering high availability, automated backups, and encrypted transit.
              </p>
            </div>

            <div
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "16px",
                padding: "24px",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "10px",
                  background: "rgba(245, 158, 11, 0.2)",
                  color: "#fbbf24",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                }}
              >
                <Zap size={22} />
              </div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#ffffff", marginBottom: "8px" }}>
                Real-Time Management
              </h3>
              <p style={{ fontSize: "0.875rem", color: "var(--slate-400)", lineHeight: 1.5 }}>
                Instant synchronization of prescription statuses, consultation transitions, billing clearances, and staff authorizations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          CALL-TO-ACTION SECTION: Join the Future of Digital Healthcare
          ========================================================================= */}
      <section
        style={{
          padding: "96px 24px",
          background: "radial-gradient(circle at center, #e0f2fe 0%, #f0fdfa 60%, #ffffff 100%)",
          textAlign: "center",
          position: "relative",
        }}
      >
        <div style={{ maxWidth: "780px", margin: "0 auto" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #0284c7 0%, #0d9488 100%)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px auto",
              boxShadow: "0 10px 25px rgba(2, 132, 199, 0.35)",
            }}
          >
            <HeartPulse size={30} />
          </div>

          <h2
            style={{
              fontSize: "clamp(2.25rem, 4.5vw, 3.25rem)",
              fontWeight: 800,
              color: "var(--slate-950)",
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
              marginBottom: "16px",
            }}
          >
            Join the Future of Digital Healthcare
          </h2>

          <p
            style={{
              fontSize: "1.125rem",
              color: "var(--slate-600)",
              lineHeight: 1.65,
              marginBottom: "36px",
            }}
          >
            Empower your health journey today. Connect with top doctors, track personal vitals,
            schedule appointments, and access certified pharmacy fulfillment in one secure portal.
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <Link
              to="/register"
              className="btn btn-primary btn-lg"
              style={{
                background: "linear-gradient(135deg, #0284c7 0%, #0d9488 100%)",
                boxShadow: "0 8px 25px rgba(2, 132, 199, 0.35)",
                padding: "14px 34px",
                fontSize: "1.05rem",
              }}
            >
              Register <ArrowRight size={18} />
            </Link>

            <Link
              to="/login"
              className="btn btn-secondary btn-lg"
              style={{
                borderColor: "#cbd5e1",
                padding: "14px 30px",
                fontSize: "1.05rem",
                color: "var(--slate-800)",
              }}
            >
              Login
            </Link>
          </div>

          <div
            style={{
              marginTop: "32px",
              display: "flex",
              justifyContent: "center",
              gap: "24px",
              flexWrap: "wrap",
              fontSize: "0.8125rem",
              color: "var(--slate-500)",
              fontWeight: 600,
            }}
          >
            <span>✓ Public Registration Open for Patients & Staff</span>
            <span>✓ Certified Hospital Directory</span>
            <span>✓ 100% Cloud Protected</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          ENTERPRISE HEALTHCARE FOOTER
          ========================================================================= */}
      <footer
        style={{
          borderTop: "1px solid var(--border-color)",
          padding: "56px 32px 32px 32px",
          background: "#ffffff",
          color: "var(--slate-600)",
        }}
      >
        <div
          style={{
            maxWidth: "1240px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "40px",
            marginBottom: "40px",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #0284c7, #0d9488)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                }}
              >
                <HeartPulse size={20} />
              </div>
              <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--slate-900)" }}>
                Medicare<span style={{ color: "#0284c7" }}>Portal</span>
              </span>
            </div>
            <p style={{ fontSize: "0.875rem", lineHeight: 1.6, color: "var(--slate-500)" }}>
              Enterprise hospital management and clinical delivery system designed for seamless patient care,
              EHR telemetry, prescription fulfillment, and billing automation.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--slate-900)", marginBottom: "14px" }}>
              Quick Navigation
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.875rem" }}>
              <Link to="/register" style={{ color: "inherit" }}>Patient Registration</Link>
              <Link to="/login" style={{ color: "inherit" }}>Portal Login</Link>
              <Link to="/appointments" style={{ color: "inherit" }}>Doctor Appointments</Link>
              <Link to="/billing" style={{ color: "inherit" }}>Hospital Invoices</Link>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--slate-900)", marginBottom: "14px" }}>
              Specialist Departments
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.875rem" }}>
              <span>Cardiology & Heart Care</span>
              <span>Pediatrics & Neonatal Unit</span>
              <span>Neurology & Spine Care</span>
              <span>Orthopedics & Joint Replacement</span>
              <span>Central Hospital Pharmacy</span>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--slate-900)", marginBottom: "14px" }}>
              Hospital Emergency
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.875rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--slate-900)", fontWeight: 700 }}>
                <Phone size={16} color="#0284c7" /> 1800-MEDICARE (Toll Free)
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--slate-600)" }}>
                <Clock size={16} color="#0d9488" /> 24 Hours • 7 Days Open
              </div>
              <p style={{ fontSize: "0.8125rem", color: "var(--slate-400)", marginTop: "4px" }}>
                National Emergency Ambulance Support: Call 108
              </p>
            </div>
          </div>
        </div>

        <div
          style={{
            maxWidth: "1240px",
            margin: "0 auto",
            borderTop: "1px solid var(--border-color)",
            paddingTop: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            fontSize: "0.8125rem",
            color: "var(--slate-400)",
          }}
        >
          <div>
            © {new Date().getFullYear()} Medicare Portal Healthcare Network. All rights reserved.
          </div>
          <div style={{ display: "flex", gap: "20px" }}>
            <span>Privacy Policy</span>
            <span>Terms of Clinical Service</span>
            <span>Security Disclosures</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
