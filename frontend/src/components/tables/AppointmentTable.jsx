import React from "react";
import StatusBadge from "../common/StatusBadge";
import { formatDate } from "../../utils/formatters";
import { CheckCircle, XCircle } from "lucide-react";

export const AppointmentTable = ({ appointments, onUpdateStatus, onCancel, canManage = false }) => {
  if (!appointments || appointments.length === 0) {
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
        <p style={{ fontSize: "1rem", fontWeight: 500 }}>No Appointments Scheduled</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="custom-table">
        <thead>
          <tr>
            <th>Date & Time</th>
            <th>Patient</th>
            <th>Specialist</th>
            <th>Clinical Reason</th>
            <th>Status</th>
            {canManage && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {appointments.map((apt) => (
            <tr key={apt._id}>
              <td style={{ fontWeight: 600, color: "var(--slate-900)" }}>
                <div>{formatDate(apt.date)}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--slate-500)" }}>{apt.time}</div>
              </td>
              <td>
                <div style={{ fontWeight: 600 }}>{apt.patientName || apt.patientId?.name || "Patient"}</div>
                {apt.patientId?.phone && (
                  <div style={{ fontSize: "0.75rem", color: "var(--slate-400)" }}>{apt.patientId.phone}</div>
                )}
              </td>
              <td>
                <div style={{ fontWeight: 600, color: "var(--primary-700)" }}>
                  {apt.doctorName || apt.doctorId?.name || "Dr. Specialist"}
                </div>
                {apt.doctorId?.specialty && (
                  <div style={{ fontSize: "0.75rem", color: "var(--slate-500)" }}>{apt.doctorId.specialty}</div>
                )}
              </td>
              <td>{apt.reason}</td>
              <td>
                <StatusBadge status={apt.status} />
              </td>
              {canManage && (
                <td>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {apt.status === "Scheduled" && onUpdateStatus && (
                      <button
                        onClick={() => onUpdateStatus(apt._id, "Completed")}
                        className="btn btn-secondary btn-sm"
                        style={{ color: "var(--emerald-600)", padding: "4px 8px" }}
                        title="Mark as Completed"
                      >
                        <CheckCircle size={14} /> Complete
                      </button>
                    )}
                    {apt.status !== "Cancelled" && apt.status !== "Completed" && onCancel && (
                      <button
                        onClick={() => onCancel(apt._id)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: "var(--rose-600)", padding: "4px 8px" }}
                        title="Cancel Appointment"
                      >
                        <XCircle size={14} /> Cancel
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AppointmentTable;
