import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import appointmentService from "../../services/appointmentService";
import patientService from "../../services/patientService";
import StatCard from "../../components/common/StatCard";
import AppointmentTable from "../../components/tables/AppointmentTable";
import PatientTable from "../../components/tables/PatientTable";
import Modal from "../../components/common/Modal";
import {
  Users,
  Calendar,
  Clock,
  CheckCircle,
  FilePlus2,
  Stethoscope,
} from "lucide-react";

export const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Prescription Modal State
  const [selectedPatientForRx, setSelectedPatientForRx] = useState(null);
  const [rxMedication, setRxMedication] = useState("");
  const [rxDosage, setRxDosage] = useState("");
  const [rxFrequency, setRxFrequency] = useState("Once daily with meal");
  const [savingRx, setSavingRx] = useState(false);

  // Patient EHR Profile Modal
  const [viewingPatient, setViewingPatient] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [aptRes, patRes] = await Promise.all([
        appointmentService.getAll().catch(() => ({ appointments: [] })),
        patientService.getAll().catch(() => ({ patients: [] })),
      ]);

      if (aptRes.success && aptRes.appointments) {
        setAppointments(aptRes.appointments);
      }
      if (patRes.success && patRes.patients) {
        setPatients(patRes.patients);
      }
    } catch (err) {
      console.error("Error loading doctor data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await appointmentService.updateStatus(id, { status });
      loadData();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;
    try {
      await appointmentService.cancel(id);
      loadData();
    } catch (err) {
      alert("Failed to cancel appointment");
    }
  };

  const handleIssuePrescription = async (e) => {
    e.preventDefault();
    if (!selectedPatientForRx) return;
    setSavingRx(true);
    try {
      await patientService.addPrescription(selectedPatientForRx._id, {
        medication: rxMedication,
        dosage: rxDosage,
        frequency: rxFrequency,
      });
      setSelectedPatientForRx(null);
      setRxMedication("");
      setRxDosage("");
      loadData();
    } catch (err) {
      alert("Failed to issue digital prescription");
    } finally {
      setSavingRx(false);
    }
  };

  const scheduledCount = appointments.filter((a) => a.status === "Scheduled").length;
  const completedCount = appointments.filter((a) => a.status === "Completed").length;

  return (
    <div>
      {/* Top Banner */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--slate-900)" }}>
          Doctor Consultation Station
        </h1>
        <p style={{ color: "var(--slate-500)", marginTop: "4px" }}>
          Logged in as {user?.name} • Department: {user?.department || "General Medicine"}
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid-cols-4" style={{ marginBottom: "28px" }}>
        <StatCard
          title="Scheduled Consultations"
          value={scheduledCount}
          change="Awaiting Consultation"
          icon={Clock}
          color="teal"
        />
        <StatCard
          title="Completed Today"
          value={completedCount}
          change="Consultations Finalized"
          icon={CheckCircle}
          color="emerald"
        />
        <StatCard
          title="Registered Patients"
          value={patients.length}
          change="Active EHR Profiles"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Consultation Shift"
          value={user?.shift || "Regular (09:00 - 17:00)"}
          change={user?.roomNumber ? `Room ${user.roomNumber}` : "Main Clinic"}
          icon={Stethoscope}
          color="indigo"
        />
      </div>

      {/* Consultation Queue */}
      <div style={{ marginBottom: "36px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Clinical Appointment Queue</h2>
            <p style={{ fontSize: "0.8125rem", color: "var(--slate-500)" }}>
              Manage appointments, complete sessions, and review clinical indications.
            </p>
          </div>
        </div>

        <AppointmentTable
          appointments={appointments}
          onUpdateStatus={handleUpdateStatus}
          onCancel={handleCancel}
          canManage={true}
        />
      </div>

      {/* Patient Directory for Clinical Management */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Assigned Patients & EHR Records</h2>
            <p style={{ fontSize: "0.8125rem", color: "var(--slate-500)" }}>
              Review patient charts, allergy logs, vitals history, and issue new prescriptions.
            </p>
          </div>
        </div>

        <PatientTable
          patients={patients}
          onSelectPatient={(p) => setViewingPatient(p)}
          onAddPrescription={(p) => setSelectedPatientForRx(p)}
          canPrescribe={true}
        />
      </div>

      {/* Prescription Issuance Modal */}
      <Modal
        isOpen={Boolean(selectedPatientForRx)}
        onClose={() => setSelectedPatientForRx(null)}
        title={`Issue Digital Rx – ${selectedPatientForRx?.firstName} ${selectedPatientForRx?.lastName}`}
      >
        <form onSubmit={handleIssuePrescription}>
          <div className="form-group">
            <label className="form-label">Medication Name & Formulation</label>
            <input
              type="text"
              className="form-input"
              value={rxMedication}
              onChange={(e) => setRxMedication(e.target.value)}
              placeholder="e.g. Lisinopril Oral Tablet"
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group">
              <label className="form-label">Dosage (Strength)</label>
              <input
                type="text"
                className="form-input"
                value={rxDosage}
                onChange={(e) => setRxDosage(e.target.value)}
                placeholder="e.g. 10mg"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Frequency / Instructions</label>
              <input
                type="text"
                className="form-input"
                value={rxFrequency}
                onChange={(e) => setRxFrequency(e.target.value)}
                placeholder="e.g. Twice daily after meals"
                required
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "20px" }}>
            <button
              type="button"
              onClick={() => setSelectedPatientForRx(null)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingRx}
              className="btn btn-primary"
            >
              {savingRx ? "Signing Prescription..." : "Sign & Transmit to Pharmacy"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Patient EHR Modal */}
      <Modal
        isOpen={Boolean(viewingPatient)}
        onClose={() => setViewingPatient(null)}
        title={`Electronic Health Record – ${viewingPatient?.firstName} ${viewingPatient?.lastName}`}
      >
        {viewingPatient && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--slate-500)", fontWeight: 700 }}>DOB / AGE</span>
                <p style={{ fontWeight: 600 }}>{viewingPatient.dob || "Not specified"}</p>
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--slate-500)", fontWeight: 700 }}>BLOOD TYPE</span>
                <p style={{ fontWeight: 700, color: "var(--rose-600)" }}>{viewingPatient.bloodGroup || "Not specified"}</p>
              </div>
            </div>

            <div style={{ padding: "12px", background: "#fef2f2", borderRadius: "var(--radius-md)", marginBottom: "16px" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--rose-600)", fontWeight: 700 }}>ALLERGIES</span>
              <p style={{ fontWeight: 600, color: "#9f1239" }}>{viewingPatient.allergies || "None specified"}</p>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--slate-500)", fontWeight: 700 }}>VITALS OVERVIEW</span>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginTop: "6px" }}>
                <div style={{ padding: "8px", background: "var(--slate-50)", borderRadius: "var(--radius-sm)" }}>
                  <div style={{ fontSize: "0.6875rem", color: "var(--slate-400)" }}>BP</div>
                  <div style={{ fontWeight: 700, fontSize: "0.8125rem" }}>{viewingPatient.vitals?.bloodPressure || "N/A"}</div>
                </div>
                <div style={{ padding: "8px", background: "var(--slate-50)", borderRadius: "var(--radius-sm)" }}>
                  <div style={{ fontSize: "0.6875rem", color: "var(--slate-400)" }}>HEART RATE</div>
                  <div style={{ fontWeight: 700, fontSize: "0.8125rem" }}>{viewingPatient.vitals?.heartRate ? `${viewingPatient.vitals.heartRate} bpm` : "N/A"}</div>
                </div>
                <div style={{ padding: "8px", background: "var(--slate-50)", borderRadius: "var(--radius-sm)" }}>
                  <div style={{ fontSize: "0.6875rem", color: "var(--slate-400)" }}>TEMP</div>
                  <div style={{ fontWeight: 700, fontSize: "0.8125rem" }}>{viewingPatient.vitals?.temperature ? `${viewingPatient.vitals.temperature} °F` : "N/A"}</div>
                </div>
                <div style={{ padding: "8px", background: "var(--slate-50)", borderRadius: "var(--radius-sm)" }}>
                  <div style={{ fontSize: "0.6875rem", color: "var(--slate-400)" }}>SpO2</div>
                  <div style={{ fontWeight: 700, fontSize: "0.8125rem" }}>{viewingPatient.vitals?.oxygenLevel ? `${viewingPatient.vitals.oxygenLevel}%` : "N/A"}</div>
                </div>
              </div>
            </div>

            <div>
              <span style={{ fontSize: "0.75rem", color: "var(--slate-500)", fontWeight: 700 }}>PAST MEDICAL HISTORY</span>
              <p style={{ fontSize: "0.875rem", color: "var(--slate-700)", marginTop: "4px" }}>
                {viewingPatient.history || "No prior clinical history recorded."}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DoctorDashboard;
