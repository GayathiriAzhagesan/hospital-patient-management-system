import React, { useState, useEffect } from "react";
import patientService from "../../services/patientService";
import { useAuth } from "../../context/AuthContext";
import PatientTable from "../../components/tables/PatientTable";
import Modal from "../../components/common/Modal";
import PatientForm from "../../components/forms/PatientForm";
import { FileText, Plus, Search, HeartPulse, AlertCircle, Pill } from "lucide-react";

export const MedicalRecordsPage = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await patientService.getAll({ search });
      if (res.success && res.patients) {
        setPatients(res.patients);
      }
    } catch (err) {
      console.error("Error loading patient records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [search]);

  const canEdit = user?.role === "Doctor" || user?.role === "Admin";

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--slate-900)" }}>
            Electronic Health Records (EHR)
          </h1>
          <p style={{ color: "var(--slate-500)", marginTop: "4px" }}>
            Comprehensive patient charts, vitals telemetry, allergy logs, and medical history
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-primary"
          >
            <Plus size={18} /> Add Patient Record
          </button>
        )}
      </div>

      {/* Search Filter Bar */}
      <div style={{ maxWidth: "480px", marginBottom: "20px", position: "relative" }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search by patient name, email, phone, blood group..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div style={{ padding: "60px 0", textAlign: "center", color: "var(--slate-400)" }}>
          Loading clinical patient records...
        </div>
      ) : (
        <PatientTable
          patients={patients}
          onSelectPatient={(p) => setSelectedPatient(p)}
          canPrescribe={false}
        />
      )}

      {/* Detailed EHR Profile Modal */}
      <Modal
        isOpen={Boolean(selectedPatient)}
        onClose={() => setSelectedPatient(null)}
        title={`Electronic Health Record – ${selectedPatient?.firstName} ${selectedPatient?.lastName}`}
        maxWidth="680px"
      >
        {selectedPatient && (
          <div>
            {/* Header info */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--slate-500)", fontWeight: 700 }}>DEMOGRAPHICS</span>
                <p style={{ fontWeight: 600, marginTop: "2px" }}>
                  {selectedPatient.gender?.toUpperCase()} • DOB: {selectedPatient.dob || "N/A"}
                </p>
                <p style={{ fontSize: "0.8125rem", color: "var(--slate-600)" }}>
                  Phone: {selectedPatient.phone || "None"}
                </p>
                <p style={{ fontSize: "0.8125rem", color: "var(--slate-600)" }}>
                  Email: {selectedPatient.email || "None"}
                </p>
              </div>

              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--slate-500)", fontWeight: 700 }}>BLOOD TYPE</span>
                <div style={{ marginTop: "4px" }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "4px 12px",
                      borderRadius: "6px",
                      background: selectedPatient.bloodGroup ? "#fef2f2" : "#f1f5f9",
                      color: selectedPatient.bloodGroup ? "var(--rose-600)" : "var(--slate-500)",
                      fontWeight: 800,
                      fontSize: "1rem",
                    }}
                  >
                    {selectedPatient.bloodGroup || "Not specified"}
                  </span>
                </div>
              </div>
            </div>

            {/* Vitals Telemetry */}
            <div style={{ marginBottom: "20px" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--slate-500)", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                <HeartPulse size={16} color="var(--primary-600)" /> LATEST CLINICAL VITALS
              </span>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginTop: "8px" }}>
                <div style={{ padding: "10px", background: "var(--slate-50)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                  <div style={{ fontSize: "0.6875rem", color: "var(--slate-400)" }}>BLOOD PRESSURE</div>
                  <div style={{ fontWeight: 700, fontSize: "0.875rem", marginTop: "2px" }}>
                    {selectedPatient.vitals?.bloodPressure || "Not recorded"}
                  </div>
                </div>
                <div style={{ padding: "10px", background: "var(--slate-50)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                  <div style={{ fontSize: "0.6875rem", color: "var(--slate-400)" }}>HEART RATE</div>
                  <div style={{ fontWeight: 700, fontSize: "0.875rem", marginTop: "2px" }}>
                    {selectedPatient.vitals?.heartRate ? `${selectedPatient.vitals.heartRate} bpm` : "Not recorded"}
                  </div>
                </div>
                <div style={{ padding: "10px", background: "var(--slate-50)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                  <div style={{ fontSize: "0.6875rem", color: "var(--slate-400)" }}>TEMPERATURE</div>
                  <div style={{ fontWeight: 700, fontSize: "0.875rem", marginTop: "2px" }}>
                    {selectedPatient.vitals?.temperature ? `${selectedPatient.vitals.temperature} °F` : "Not recorded"}
                  </div>
                </div>
                <div style={{ padding: "10px", background: "var(--slate-50)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                  <div style={{ fontSize: "0.6875rem", color: "var(--slate-400)" }}>OXYGEN (SpO2)</div>
                  <div style={{ fontWeight: 700, fontSize: "0.875rem", marginTop: "2px" }}>
                    {selectedPatient.vitals?.oxygenLevel ? `${selectedPatient.vitals.oxygenLevel}%` : "Not recorded"}
                  </div>
                </div>
              </div>
            </div>

            {/* Allergies & History */}
            <div style={{ padding: "12px", background: "#fef2f2", borderRadius: "var(--radius-md)", marginBottom: "16px", border: "1px solid #fecdd3" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--rose-600)", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                <AlertCircle size={14} /> KNOWN ALLERGIES
              </span>
              <p style={{ fontWeight: 600, color: "#9f1239", marginTop: "4px", fontSize: "0.875rem" }}>
                {selectedPatient.allergies || "None reported"}
              </p>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--slate-500)", fontWeight: 700 }}>CLINICAL HISTORY</span>
              <p style={{ fontSize: "0.875rem", color: "var(--slate-700)", marginTop: "4px", lineHeight: 1.5 }}>
                {selectedPatient.history || "No prior clinical history recorded."}
              </p>
            </div>

            {/* Prescriptions */}
            <div>
              <span style={{ fontSize: "0.75rem", color: "var(--slate-500)", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                <Pill size={16} color="var(--primary-600)" /> MEDICATIONS & PRESCRIPTION HISTORY
              </span>
              {(!selectedPatient.prescriptions || selectedPatient.prescriptions.length === 0) ? (
                <p style={{ fontSize: "0.8125rem", color: "var(--slate-400)", marginTop: "6px" }}>
                  No Prescriptions Found
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
                  {selectedPatient.prescriptions.map((rx, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "10px",
                        background: "var(--slate-50)",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border-color)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <strong style={{ fontSize: "0.875rem" }}>{rx.medication} ({rx.dosage})</strong>
                        <span style={{ fontSize: "0.75rem", color: rx.status === "Active" ? "#b45309" : "#15803d", fontWeight: 700 }}>
                          {rx.status}
                        </span>
                      </div>
                      <p style={{ fontSize: "0.75rem", color: "var(--slate-500)", marginTop: "2px" }}>
                        {rx.frequency} • Prescribed by {rx.prescribedBy} on {rx.date}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Create Patient Record Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Register Patient EHR Profile"
      >
        <PatientForm
          onSuccess={() => {
            setIsCreateModalOpen(false);
            fetchPatients();
          }}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default MedicalRecordsPage;
