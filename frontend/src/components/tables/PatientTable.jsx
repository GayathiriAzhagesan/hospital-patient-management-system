import React from "react";
import { Eye, PlusCircle } from "lucide-react";

export const PatientTable = ({ patients, onSelectPatient, onAddPrescription, canPrescribe = false }) => {
  if (!patients || patients.length === 0) {
    return (
      <div
        style={{
          padding: "48px 24px",
          textAlign: "center",
          color: "var(--slate-400)",
          background: "#ffffff",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border-color)",
        }}
      >
        <p style={{ fontSize: "1rem", fontWeight: 500 }}>No Patients Found</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="custom-table">
        <thead>
          <tr>
            <th>Patient Name</th>
            <th>Contact Details</th>
            <th>Blood Group</th>
            <th>Allergies</th>
            <th>Latest Vitals (BP / HR)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr key={patient._id}>
              <td style={{ fontWeight: 600, color: "var(--slate-900)" }}>
                <div>{patient.firstName} {patient.lastName}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--slate-400)", textTransform: "capitalize" }}>
                  {patient.gender || "Patient"} {patient.dob ? `• DOB: ${patient.dob}` : ""}
                </div>
              </td>
              <td>
                <div style={{ fontSize: "0.8125rem" }}>{patient.phone || "No phone"}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--slate-400)" }}>{patient.email || "No email"}</div>
              </td>
              <td>
                <span
                  style={{
                    display: "inline-block",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    background: patient.bloodGroup ? "#fef2f2" : "#f1f5f9",
                    color: patient.bloodGroup ? "var(--rose-600)" : "var(--slate-500)",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                  }}
                >
                  {patient.bloodGroup || "N/A"}
                </span>
              </td>
              <td style={{ fontSize: "0.8125rem", color: "var(--slate-600)" }}>
                {patient.allergies || "None"}
              </td>
              <td>
                <span style={{ fontSize: "0.8125rem", fontWeight: 500, color: patient.vitals?.bloodPressure ? "var(--slate-800)" : "var(--slate-400)" }}>
                  {patient.vitals?.bloodPressure
                    ? `${patient.vitals.bloodPressure} • ${patient.vitals.heartRate ? `${patient.vitals.heartRate} bpm` : "N/A"}`
                    : "Not recorded"}
                </span>
              </td>
              <td>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => onSelectPatient(patient)}
                    className="btn btn-secondary btn-sm"
                    title="View Patient EHR Profile"
                  >
                    <Eye size={14} /> View EHR
                  </button>
                  {canPrescribe && onAddPrescription && (
                    <button
                      onClick={() => onAddPrescription(patient)}
                      className="btn btn-primary btn-sm"
                      title="Issue Prescription"
                    >
                      <PlusCircle size={14} /> Prescribe
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PatientTable;
