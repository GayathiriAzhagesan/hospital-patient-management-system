import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import patientService from "../../services/patientService";
import doctorService from "../../services/doctorService";
import appointmentService from "../../services/appointmentService";
import invoiceService from "../../services/invoiceService";
import StatCard from "../../components/common/StatCard";
import Modal from "../../components/common/Modal";
import PatientForm from "../../components/forms/PatientForm";
import InvoiceForm from "../../components/forms/InvoiceForm";
import { formatCurrency } from "../../utils/formatters";
import {
  Users,
  Stethoscope,
  Calendar,
  CreditCard,
  Building2,
  TrendingUp,
  ShieldCheck,
  Plus,
} from "lucide-react";

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [patRes, docRes, aptRes, invRes] = await Promise.all([
        patientService.getAll().catch(() => ({ patients: [] })),
        doctorService.getAll().catch(() => ({ doctors: [] })),
        appointmentService.getAll().catch(() => ({ appointments: [] })),
        invoiceService.getAll().catch(() => ({ invoices: [] })),
      ]);

      if (patRes.success && patRes.patients) setPatients(patRes.patients);
      if (docRes.success && docRes.doctors) setDoctors(docRes.doctors);
      if (aptRes.success && aptRes.appointments) setAppointments(aptRes.appointments);
      if (invRes.success && invRes.invoices) setInvoices(invRes.invoices);
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalRevenue = invoices
    .filter((inv) => inv.paid)
    .reduce((acc, inv) => acc + (inv.total || 0), 0);

  const pendingRevenue = invoices
    .filter((inv) => !inv.paid)
    .reduce((acc, inv) => acc + (inv.total || 0), 0);

  return (
    <div>
      {/* Top Banner */}
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
            Hospital System Administration & Analytics
          </h1>
          <p style={{ color: "var(--slate-500)", marginTop: "4px" }}>
            Operational Command • Department Occupancy • Financial Clearances
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => setIsPatientModalOpen(true)}
            className="btn btn-secondary"
          >
            <Plus size={16} /> Register Patient
          </button>
          <button
            onClick={() => setIsInvoiceModalOpen(true)}
            className="btn btn-primary"
          >
            <Plus size={16} /> Generate Invoice
          </button>
        </div>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid-cols-4" style={{ marginBottom: "28px" }}>
        <StatCard
          title="Collected Revenue"
          value={formatCurrency(totalRevenue)}
          change={`Pending: ${formatCurrency(pendingRevenue)}`}
          icon={CreditCard}
          color="emerald"
        />
        <StatCard
          title="Total Registered Patients"
          value={patients.length}
          change={`${patients.length} active records`}
          icon={Users}
          color="teal"
        />
        <StatCard
          title="Clinical Medical Staff"
          value={doctors.length}
          change={`${new Set(doctors.map((d) => d.specialty).filter(Boolean)).size} Specialties Active`}
          icon={Stethoscope}
          color="indigo"
        />
        <StatCard
          title="Total Consultations"
          value={appointments.length}
          change={`${appointments.filter((a) => a.status === "Scheduled").length} Scheduled`}
          icon={Calendar}
          color="amber"
        />
      </div>

      {/* Grid: Department Occupancy + System Audit Log */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "32px" }}>
        {/* Department Occupancy */}
        <div className="card">
          <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Building2 size={18} color="var(--primary-600)" /> Department Capacity & Distribution
          </h3>

          {doctors.length === 0 ? (
            <div style={{ padding: "40px 16px", textAlign: "center", color: "var(--slate-400)", fontSize: "0.875rem" }}>
              No department occupancy recorded yet
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {Object.entries(
                doctors.reduce((acc, doc) => {
                  const dept = doc.department || "General Medicine";
                  acc[dept] = (acc[dept] || 0) + 1;
                  return acc;
                }, {})
              ).map(([dept, count], idx) => {
                const percent = Math.min(100, Math.round((count / doctors.length) * 100));
                const colors = ["var(--primary-600)", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];
                const color = colors[idx % colors.length];
                return (
                  <div key={dept}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", marginBottom: "6px" }}>
                      <span style={{ fontWeight: 600 }}>{dept}</span>
                      <span style={{ color: "var(--slate-500)" }}>{count} Staff ({percent}%)</span>
                    </div>
                    <div style={{ width: "100%", height: "8px", background: "var(--slate-100)", borderRadius: "9999px", overflow: "hidden" }}>
                      <div style={{ width: `${percent}%`, height: "100%", background: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Security & Audit Logs */}
        <div className="card">
          <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <ShieldCheck size={18} color="var(--emerald-600)" /> Live System Activity & Audit Log
          </h3>

          {appointments.length === 0 && invoices.length === 0 && patients.length === 0 ? (
            <div style={{ padding: "40px 16px", textAlign: "center", color: "var(--slate-400)", fontSize: "0.875rem" }}>
              No recent activity logs
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                ...appointments.slice(-2).map((apt) => ({
                  title: "APPOINTMENT_SCHEDULED",
                  time: apt.date || "Recent",
                  desc: `Consultation (${apt.status}) for ${apt.patientName || apt.patientId?.name || "Patient"} with ${apt.doctorName || apt.doctorId?.name || "Specialist"}`,
                })),
                ...invoices.slice(-2).map((inv) => ({
                  title: "BILLING_TRANSACTION",
                  time: inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "Recent",
                  desc: `Invoice #${inv.invoiceNumber} for ${inv.patientName || "Patient"} - ${inv.paid ? "Paid" : "Pending"} (${formatCurrency(inv.total)})`,
                })),
              ].map((log, index) => (
                <div
                  key={index}
                  style={{
                    padding: "10px",
                    background: "var(--slate-50)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--slate-400)" }}>
                    <span style={{ fontWeight: 600, color: "var(--primary-700)" }}>{log.title}</span>
                    <span>{log.time}</span>
                  </div>
                  <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--slate-800)", marginTop: "2px" }}>
                    {log.desc}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Staff Directory Overview */}
      <div className="card">
        <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "16px" }}>
          Registered Clinical Specialists
        </h3>
        {doctors.length === 0 ? (
          <div style={{ padding: "40px 16px", textAlign: "center", color: "var(--slate-400)", fontSize: "0.875rem" }}>
            No Doctors Found
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Doctor Name</th>
                  <th>Specialty</th>
                  <th>Department</th>
                  <th>Shift</th>
                  <th>Fee</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doc) => (
                  <tr key={doc._id}>
                    <td style={{ fontWeight: 600, color: "var(--slate-900)" }}>{doc.name}</td>
                    <td>{doc.specialty}</td>
                    <td>{doc.department}</td>
                    <td>
                      <span style={{ fontSize: "0.75rem", padding: "2px 8px", borderRadius: "4px", background: "#f0fdfa", color: "var(--primary-700)", fontWeight: 600 }}>
                        {doc.shift || "Day"}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>{formatCurrency(doc.consultationFee || 0)}</td>
                    <td>{doc.roomNumber || "Main Clinic"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        title="Register New Patient EHR"
      >
        <PatientForm
          onSuccess={() => {
            setIsPatientModalOpen(false);
            loadData();
          }}
          onCancel={() => setIsPatientModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        title="Generate Billing Invoice"
      >
        <InvoiceForm
          onSuccess={() => {
            setIsInvoiceModalOpen(false);
            loadData();
          }}
          onCancel={() => setIsInvoiceModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default AdminDashboard;
