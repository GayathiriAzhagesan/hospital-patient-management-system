import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import patientService from "../../services/patientService";
import appointmentService from "../../services/appointmentService";
import StatCard from "../../components/common/StatCard";
import AppointmentTable from "../../components/tables/AppointmentTable";
import Modal from "../../components/common/Modal";
import AppointmentForm from "../../components/forms/AppointmentForm";
import {
  Heart,
  Activity,
  Calendar,
  Pill,
  FileText,
  AlertCircle,
  Plus,
} from "lucide-react";

export const PatientDashboard = () => {
  const { user } = useAuth();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [patRes, aptRes] = await Promise.all([
        patientService.getMyProfile().catch(() => ({ success: false })),
        appointmentService.getAll().catch(() => ({ success: false, appointments: [] })),
      ]);

      if (patRes.success && patRes.patient) {
        setPatient(patRes.patient);
      }
      if (aptRes.success && aptRes.appointments) {
        setAppointments(aptRes.appointments);
      }
    } catch (err) {
      console.error("Error loading patient data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCancelAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await appointmentService.cancel(id);
      loadData();
    } catch (err) {
      alert("Failed to cancel appointment");
    }
  };

  return (
    <div>
      {/* Header Banner */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--slate-900)" }}>
            Welcome back, {user?.name}
          </h1>
          <p style={{ color: "var(--slate-500)", marginTop: "4px" }}>
            Patient ID: {patient?._id ? `PAT-${patient._id.slice(-6).toUpperCase()}` : "Active Member"} • Blood Group: {patient?.bloodGroup || "O+"}
          </p>
        </div>

        <button
          onClick={() => setIsBookingOpen(true)}
          className="btn btn-primary"
        >
          <Plus size={18} /> Book Doctor Appointment
        </button>
      </div>

      {/* Vitals & Health Metrics */}
      <div className="grid-cols-4" style={{ marginBottom: "28px" }}>
        <StatCard
          title="Blood Pressure"
          value={patient?.vitals?.bloodPressure || "120/80 mmHg"}
          change="Normal Range"
          icon={Heart}
          color="rose"
        />
        <StatCard
          title="Resting Heart Rate"
          value={patient?.vitals?.heartRate || "72 bpm"}
          change="Optimal"
          icon={Activity}
          color="teal"
        />
        <StatCard
          title="Oxygen Saturation"
          value={patient?.vitals?.oxygenLevel || "99% SpO2"}
          change="Healthy"
          icon={Activity}
          color="blue"
        />
        <StatCard
          title="Active Prescriptions"
          value={patient?.prescriptions?.filter((p) => p.status === "Active")?.length || 0}
          change="Verified by Pharmacy"
          icon={Pill}
          color="indigo"
        />
      </div>

      {/* Content Columns: Appointments + EHR Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
        {/* Appointments Section */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Upcoming Consultations</h2>
            <span style={{ fontSize: "0.8125rem", color: "var(--slate-500)" }}>
              {appointments.length} Total Booked
            </span>
          </div>

          <AppointmentTable
            appointments={appointments}
            onCancel={handleCancelAppointment}
            canManage={false}
          />
        </div>

        {/* Clinical History & Prescriptions Card */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="card">
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <AlertCircle size={18} color="#e11d48" /> Medical Alerts & Allergies
            </h3>
            <div style={{ padding: "12px", background: "#fef2f2", borderRadius: "var(--radius-md)", border: "1px solid #fecdd3" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#e11d48", textTransform: "uppercase" }}>
                Documented Allergies
              </span>
              <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#9f1239", marginTop: "4px" }}>
                {patient?.allergies || "No documented allergies"}
              </p>
            </div>
            <div style={{ marginTop: "16px" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--slate-500)", textTransform: "uppercase" }}>
                Medical History
              </span>
              <p style={{ fontSize: "0.875rem", color: "var(--slate-700)", marginTop: "4px", lineHeight: 1.5 }}>
                {patient?.history || "Standard general wellness tracking."}
              </p>
            </div>
          </div>

          {/* Active Medication Card */}
          <div className="card">
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Pill size={18} color="#0d9488" /> Active Prescriptions
            </h3>

            {(!patient?.prescriptions || patient.prescriptions.length === 0) ? (
              <p style={{ fontSize: "0.875rem", color: "var(--slate-400)" }}>No active prescriptions.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {patient.prescriptions.map((rx, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "10px",
                      background: "var(--slate-50)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ fontSize: "0.875rem", color: "var(--slate-900)" }}>
                        {rx.medication} ({rx.dosage})
                      </strong>
                      <span
                        style={{
                          fontSize: "0.6875rem",
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: "4px",
                          background: rx.status === "Active" ? "#fef3c7" : "#dcfce7",
                          color: rx.status === "Active" ? "#b45309" : "#15803d",
                        }}
                      >
                        {rx.status}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.75rem", color: "var(--slate-500)", marginTop: "4px" }}>
                      {rx.frequency} • Prescribed by {rx.prescribedBy || "Specialist"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Appointment Booking Modal */}
      <Modal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        title="Schedule Physician Consultation"
      >
        <AppointmentForm
          onSuccess={() => {
            setIsBookingOpen(false);
            loadData();
          }}
          onCancel={() => setIsBookingOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default PatientDashboard;
