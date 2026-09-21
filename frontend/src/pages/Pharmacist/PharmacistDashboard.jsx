import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import patientService from "../../services/patientService";
import StatCard from "../../components/common/StatCard";
import { Pill, CheckCircle2, Clock, PackageCheck, AlertTriangle } from "lucide-react";

export const PharmacistDashboard = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await patientService.getAll();
      if (res.success && res.patients) {
        setPatients(res.patients);
      }
    } catch (err) {
      console.error("Error loading pharmacy data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDispense = async (patientId, prescId) => {
    try {
      await patientService.updatePrescriptionStatus(patientId, prescId, "Dispensed");
      loadData();
    } catch (err) {
      alert("Failed to update dispensing log");
    }
  };

  // Flatten all prescriptions across all patients
  const allPrescriptions = [];
  patients.forEach((patient) => {
    (patient.prescriptions || []).forEach((rx) => {
      allPrescriptions.push({
        ...rx,
        patientId: patient._id,
        patientName: `${patient.firstName} ${patient.lastName}`,
        patientAllergies: patient.allergies,
        patientPhone: patient.phone,
      });
    });
  });

  const filteredPrescriptions = allPrescriptions.filter((item) => {
    if (filter === "active") return item.status === "Active";
    if (filter === "dispensed") return item.status === "Dispensed";
    return true;
  });

  const activeCount = allPrescriptions.filter((p) => p.status === "Active").length;
  const dispensedCount = allPrescriptions.filter((p) => p.status === "Dispensed").length;

  return (
    <div>
      {/* Banner */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--slate-900)" }}>
          Central Hospital Pharmacy & Dispensary
        </h1>
        <p style={{ color: "var(--slate-500)", marginTop: "4px" }}>
          Logged in as {user?.name} • Department: {user?.department || "Central Pharmacy"}
        </p>
      </div>

      {/* Stats */}
      <div className="grid-cols-4" style={{ marginBottom: "28px" }}>
        <StatCard
          title="Pending Dispensation"
          value={activeCount}
          change="Awaiting Pharmacist Check"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Dispensed Medicines"
          value={dispensedCount}
          change="Fulfillment Completed"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Total Prescription Logs"
          value={allPrescriptions.length}
          change="Cross-Department Sync"
          icon={Pill}
          color="teal"
        />
        <StatCard
          title="Stock Quality Index"
          value="99.4%"
          change="Batch Traceability OK"
          icon={PackageCheck}
          color="indigo"
        />
      </div>

      {/* Prescription Queue Section */}
      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Prescription Fulfillment Queue</h2>
            <p style={{ fontSize: "0.8125rem", color: "var(--slate-500)" }}>
              Verify dosage, check patient allergy contraindications, and log medicine dispensing.
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => setFilter("all")}
              className={`btn btn-sm ${filter === "all" ? "btn-primary" : "btn-secondary"}`}
            >
              All ({allPrescriptions.length})
            </button>
            <button
              onClick={() => setFilter("active")}
              className={`btn btn-sm ${filter === "active" ? "btn-primary" : "btn-secondary"}`}
            >
              Pending ({activeCount})
            </button>
            <button
              onClick={() => setFilter("dispensed")}
              className={`btn btn-sm ${filter === "dispensed" ? "btn-primary" : "btn-secondary"}`}
            >
              Dispensed ({dispensedCount})
            </button>
          </div>
        </div>

        {filteredPrescriptions.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--slate-400)" }}>
            No prescriptions matching filter.
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Prescription / Medication</th>
                  <th>Dosage & Frequency</th>
                  <th>Patient Details</th>
                  <th>Allergy Warning</th>
                  <th>Prescribing Physician</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrescriptions.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 700, color: "var(--slate-900)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Pill size={16} color="var(--primary-600)" />
                        {item.medication}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--slate-400)", marginTop: "2px" }}>
                        Issued: {item.date || "Recent"}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.dosage}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--slate-500)" }}>{item.frequency}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.patientName}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--slate-400)" }}>{item.patientPhone}</div>
                    </td>
                    <td>
                      {item.patientAllergies && item.patientAllergies !== "None" ? (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            background: "#fef2f2",
                            color: "#e11d48",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                          }}
                        >
                          <AlertTriangle size={12} /> {item.patientAllergies}
                        </span>
                      ) : (
                        <span style={{ fontSize: "0.75rem", color: "var(--slate-400)" }}>No known allergies</span>
                      )}
                    </td>
                    <td style={{ fontSize: "0.8125rem", color: "var(--slate-700)", fontWeight: 500 }}>
                      {item.prescribedBy || "Dr. Staff"}
                    </td>
                    <td>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: "9999px",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          background: item.status === "Active" ? "#fef3c7" : "#dcfce7",
                          color: item.status === "Active" ? "#b45309" : "#15803d",
                        }}
                      >
                        ● {item.status}
                      </span>
                    </td>
                    <td>
                      {item.status === "Active" ? (
                        <button
                          onClick={() => handleDispense(item.patientId, item._id)}
                          className="btn btn-primary btn-sm"
                          style={{ background: "linear-gradient(135deg, var(--emerald-500), var(--emerald-600))" }}
                        >
                          <CheckCircle2 size={14} /> Dispense Medicine
                        </button>
                      ) : (
                        <span style={{ fontSize: "0.75rem", color: "var(--slate-400)" }}>
                          Dispensed & Logged
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PharmacistDashboard;
