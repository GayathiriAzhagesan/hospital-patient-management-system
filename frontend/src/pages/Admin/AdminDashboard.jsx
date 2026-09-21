import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import patientService from "../../services/patientService";
import doctorService from "../../services/doctorService";
import appointmentService from "../../services/appointmentService";
import invoiceService from "../../services/invoiceService";
import authService from "../../services/authService";
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
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Pill,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [pendingPharmacists, setPendingPharmacists] = useState([]);
  const [approvedStaff, setApprovedStaff] = useState([]);
  const [activeApprovalTab, setActiveApprovalTab] = useState("doctors");
  const [actionLoading, setActionLoading] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [patRes, docRes, aptRes, invRes, pendingRes, usersRes] = await Promise.all([
        patientService.getAll().catch(() => ({ patients: [] })),
        doctorService.getAll().catch(() => ({ doctors: [] })),
        appointmentService.getAll().catch(() => ({ appointments: [] })),
        invoiceService.getAll().catch(() => ({ invoices: [] })),
        authService.getPendingApprovals().catch(() => ({ doctors: [], pharmacists: [] })),
        authService.getAllUsers().catch(() => ({ users: [] })),
      ]);

      if (patRes.success && patRes.patients) setPatients(patRes.patients);
      if (docRes.success && docRes.doctors) setDoctors(docRes.doctors);
      if (aptRes.success && aptRes.appointments) setAppointments(aptRes.appointments);
      if (invRes.success && invRes.invoices) setInvoices(invRes.invoices);

      if (pendingRes.success) {
        setPendingDoctors(pendingRes.doctors || []);
        setPendingPharmacists(pendingRes.pharmacists || []);
      }

      if (usersRes.success && usersRes.users) {
        setApprovedStaff(
          usersRes.users.filter(
            (u) => (u.role === "Doctor" || u.role === "Pharmacist") && u.status === "approved"
          )
        );
      }
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (userId, newStatus, role, name) => {
    try {
      setActionLoading(userId);
      const res = await authService.updateUserStatus(userId, newStatus);
      if (res.success) {
        setStatusMessage({
          type: newStatus === "approved" ? "success" : "info",
          text: `Account for ${name || "Staff"} (${role}) has been ${newStatus}.`,
        });
        await loadData();
      }
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err.response?.data?.message || `Failed to ${newStatus} ${role} account.`,
      });
    } finally {
      setActionLoading(null);
      setTimeout(() => {
        setStatusMessage(null);
      }, 5000);
    }
  };

  const totalRevenue = invoices
    .filter((inv) => inv.paid)
    .reduce((acc, inv) => acc + (inv.total || 0), 0);

  const pendingRevenue = invoices
    .filter((inv) => !inv.paid)
    .reduce((acc, inv) => acc + (inv.total || 0), 0);

  const totalPending = pendingDoctors.length + pendingPharmacists.length;

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
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--slate-900)" }}>
            Hospital System Administration & Analytics
          </h1>
          <p style={{ color: "var(--slate-500)", marginTop: "4px" }}>
            Operational Command • Clinical Staff Credentialing • Department Occupancy • Financial Clearances
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => loadData()}
            className="btn btn-secondary"
            title="Refresh All Records"
          >
            <RefreshCw size={15} /> Refresh
          </button>
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

      {/* Notification Banner */}
      {statusMessage && (
        <div
          style={{
            marginBottom: "24px",
            padding: "14px 18px",
            borderRadius: "var(--radius-md)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: statusMessage.type === "success" ? "#ecfdf5" : statusMessage.type === "info" ? "#eff6ff" : "#fef2f2",
            border: `1px solid ${statusMessage.type === "success" ? "#a7f3d0" : statusMessage.type === "info" ? "#bfdbfe" : "#fecdd3"}`,
            color: statusMessage.type === "success" ? "var(--emerald-600)" : statusMessage.type === "info" ? "var(--blue-600)" : "var(--rose-600)",
            fontSize: "0.875rem",
            fontWeight: 600,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {statusMessage.type === "success" ? (
              <CheckCircle2 size={18} />
            ) : statusMessage.type === "info" ? (
              <UserCheck size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            style={{ color: "inherit", cursor: "pointer", fontSize: "1.25rem", lineHeight: 1 }}
          >
            &times;
          </button>
        </div>
      )}

      {/* Analytics KPI Row */}
      <div className="grid-cols-5" style={{ marginBottom: "28px" }}>
        <StatCard
          title="Staff Approvals"
          value={totalPending}
          change={totalPending > 0 ? "Requires verification" : "All credentials clear"}
          icon={UserCheck}
          color={totalPending > 0 ? "amber" : "emerald"}
        />
        <StatCard
          title="Collected Revenue"
          value={formatCurrency(totalRevenue)}
          change={`Pending: ${formatCurrency(pendingRevenue)}`}
          icon={CreditCard}
          color="emerald"
        />
        <StatCard
          title="Registered Patients"
          value={patients.length}
          change={`${patients.length} active records`}
          icon={Users}
          color="teal"
        />
        <StatCard
          title="Clinical Specialists"
          value={doctors.length}
          change={`${new Set(doctors.map((d) => d.specialty).filter(Boolean)).size} Specialties`}
          icon={Stethoscope}
          color="indigo"
        />
        <StatCard
          title="Total Consultations"
          value={appointments.length}
          change={`${appointments.filter((a) => a.status === "Scheduled").length} Scheduled`}
          icon={Calendar}
          color="blue"
        />
      </div>

      {/* Clinical Staff Credentialing & Role Approvals Section */}
      <div className="card" style={{ marginBottom: "32px", border: totalPending > 0 ? "1px solid #fde68a" : "1px solid var(--border-color)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  background: totalPending > 0 ? "#fffbeb" : "#ecfdf5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: totalPending > 0 ? "#b45309" : "var(--emerald-600)",
                }}
              >
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--slate-900)" }}>
                  Clinical Staff Credentialing & Role Approvals
                </h3>
                <p style={{ fontSize: "0.8125rem", color: "var(--slate-500)", marginTop: "2px" }}>
                  Verify licenses and authorize Doctor and Pharmacist access to hospital electronic health records.
                </p>
              </div>
            </div>
          </div>

          {/* Tab Selection */}
          <div
            style={{
              display: "flex",
              background: "var(--slate-100)",
              padding: "4px",
              borderRadius: "var(--radius-md)",
              gap: "4px",
            }}
          >
            <button
              onClick={() => setActiveApprovalTab("doctors")}
              style={{
                padding: "6px 14px",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.8125rem",
                fontWeight: 600,
                background: activeApprovalTab === "doctors" ? "#ffffff" : "transparent",
                color: activeApprovalTab === "doctors" ? "var(--slate-900)" : "var(--slate-600)",
                boxShadow: activeApprovalTab === "doctors" ? "var(--shadow-sm)" : "none",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
              }}
            >
              <Stethoscope size={14} /> Pending Doctors
              {pendingDoctors.length > 0 && (
                <span
                  style={{
                    background: "#f59e0b",
                    color: "#ffffff",
                    fontSize: "0.6875rem",
                    padding: "1px 6px",
                    borderRadius: "9999px",
                    fontWeight: 700,
                  }}
                >
                  {pendingDoctors.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveApprovalTab("pharmacists")}
              style={{
                padding: "6px 14px",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.8125rem",
                fontWeight: 600,
                background: activeApprovalTab === "pharmacists" ? "#ffffff" : "transparent",
                color: activeApprovalTab === "pharmacists" ? "var(--slate-900)" : "var(--slate-600)",
                boxShadow: activeApprovalTab === "pharmacists" ? "var(--shadow-sm)" : "none",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
              }}
            >
              <Pill size={14} /> Pending Pharmacists
              {pendingPharmacists.length > 0 && (
                <span
                  style={{
                    background: "#f59e0b",
                    color: "#ffffff",
                    fontSize: "0.6875rem",
                    padding: "1px 6px",
                    borderRadius: "9999px",
                    fontWeight: 700,
                  }}
                >
                  {pendingPharmacists.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveApprovalTab("approved")}
              style={{
                padding: "6px 14px",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.8125rem",
                fontWeight: 600,
                background: activeApprovalTab === "approved" ? "#ffffff" : "transparent",
                color: activeApprovalTab === "approved" ? "var(--slate-900)" : "var(--slate-600)",
                boxShadow: activeApprovalTab === "approved" ? "var(--shadow-sm)" : "none",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
              }}
            >
              <UserCheck size={14} /> Approved Staff ({approvedStaff.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Pending Doctors */}
        {activeApprovalTab === "doctors" && (
          <div>
            {pendingDoctors.length === 0 ? (
              <div
                style={{
                  padding: "48px 24px",
                  textAlign: "center",
                  background: "var(--slate-50)",
                  borderRadius: "var(--radius-md)",
                  border: "1px dashed var(--border-color)",
                }}
              >
                <CheckCircle2 size={36} color="var(--emerald-600)" style={{ margin: "0 auto 10px" }} />
                <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--slate-800)" }}>
                  No Pending Doctor Registrations
                </h4>
                <p style={{ color: "var(--slate-500)", fontSize: "0.875rem", marginTop: "4px" }}>
                  All physician credentials have been processed and approved.
                </p>
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Doctor Name</th>
                      <th>Email Address</th>
                      <th>Phone / Contact</th>
                      <th>Registered On</th>
                      <th>Status</th>
                      <th style={{ textAlign: "right" }}>Credential Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingDoctors.map((doc) => (
                      <tr key={doc._id}>
                        <td style={{ fontWeight: 600, color: "var(--slate-900)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                background: "var(--primary-100)",
                                color: "var(--primary-800)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 700,
                                fontSize: "0.75rem",
                              }}
                            >
                              Dr
                            </div>
                            <span>{doc.name}</span>
                          </div>
                        </td>
                        <td>{doc.email}</td>
                        <td>{doc.phone || "—"}</td>
                        <td>{new Date(doc.createdAt).toLocaleDateString()}</td>
                        <td>
                          <span className="badge badge-pending">
                            <Clock size={11} /> Awaiting Approval
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "8px" }}>
                            <button
                              onClick={() => handleUpdateStatus(doc._id, "approved", "Doctor", doc.name)}
                              disabled={actionLoading === doc._id}
                              className="btn btn-sm"
                              style={{
                                background: "#ecfdf5",
                                color: "var(--emerald-600)",
                                border: "1px solid #a7f3d0",
                                fontWeight: 600,
                                gap: "6px",
                              }}
                            >
                              <CheckCircle2 size={14} /> Approve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(doc._id, "rejected", "Doctor", doc.name)}
                              disabled={actionLoading === doc._id}
                              className="btn btn-sm"
                              style={{
                                background: "#fef2f2",
                                color: "var(--rose-600)",
                                border: "1px solid #fecdd3",
                                fontWeight: 600,
                                gap: "6px",
                              }}
                            >
                              <XCircle size={14} /> Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Pending Pharmacists */}
        {activeApprovalTab === "pharmacists" && (
          <div>
            {pendingPharmacists.length === 0 ? (
              <div
                style={{
                  padding: "48px 24px",
                  textAlign: "center",
                  background: "var(--slate-50)",
                  borderRadius: "var(--radius-md)",
                  border: "1px dashed var(--border-color)",
                }}
              >
                <CheckCircle2 size={36} color="var(--emerald-600)" style={{ margin: "0 auto 10px" }} />
                <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--slate-800)" }}>
                  No Pending Pharmacist Registrations
                </h4>
                <p style={{ color: "var(--slate-500)", fontSize: "0.875rem", marginTop: "4px" }}>
                  All pharmaceutical staff accounts are verified.
                </p>
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Pharmacist Name</th>
                      <th>Email Address</th>
                      <th>Phone / Contact</th>
                      <th>Registered On</th>
                      <th>Status</th>
                      <th style={{ textAlign: "right" }}>Credential Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingPharmacists.map((ph) => (
                      <tr key={ph._id}>
                        <td style={{ fontWeight: 600, color: "var(--slate-900)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                background: "#fdf4ff",
                                color: "#a21caf",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 700,
                                fontSize: "0.75rem",
                              }}
                            >
                              Rx
                            </div>
                            <span>{ph.name}</span>
                          </div>
                        </td>
                        <td>{ph.email}</td>
                        <td>{ph.phone || "—"}</td>
                        <td>{new Date(ph.createdAt).toLocaleDateString()}</td>
                        <td>
                          <span className="badge badge-pending">
                            <Clock size={11} /> Awaiting Approval
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "8px" }}>
                            <button
                              onClick={() => handleUpdateStatus(ph._id, "approved", "Pharmacist", ph.name)}
                              disabled={actionLoading === ph._id}
                              className="btn btn-sm"
                              style={{
                                background: "#ecfdf5",
                                color: "var(--emerald-600)",
                                border: "1px solid #a7f3d0",
                                fontWeight: 600,
                                gap: "6px",
                              }}
                            >
                              <CheckCircle2 size={14} /> Approve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(ph._id, "rejected", "Pharmacist", ph.name)}
                              disabled={actionLoading === ph._id}
                              className="btn btn-sm"
                              style={{
                                background: "#fef2f2",
                                color: "var(--rose-600)",
                                border: "1px solid #fecdd3",
                                fontWeight: 600,
                                gap: "6px",
                              }}
                            >
                              <XCircle size={14} /> Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Approved Staff Directory */}
        {activeApprovalTab === "approved" && (
          <div>
            {approvedStaff.length === 0 ? (
              <div
                style={{
                  padding: "48px 24px",
                  textAlign: "center",
                  background: "var(--slate-50)",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <Users size={36} color="var(--slate-400)" style={{ margin: "0 auto 10px" }} />
                <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--slate-800)" }}>
                  No Approved Staff Records Found
                </h4>
                <p style={{ color: "var(--slate-500)", fontSize: "0.875rem", marginTop: "4px" }}>
                  When registered doctors or pharmacists are approved, they will appear in this authorized directory.
                </p>
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Staff Member</th>
                      <th>Clinical Role</th>
                      <th>Email Address</th>
                      <th>Phone</th>
                      <th>Authorization</th>
                      <th>Approved Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvedStaff.map((staff) => (
                      <tr key={staff._id}>
                        <td style={{ fontWeight: 600, color: "var(--slate-900)" }}>{staff.name}</td>
                        <td>
                          <span
                            className={
                              staff.role === "Doctor"
                                ? "badge badge-role-doctor"
                                : "badge badge-role-pharmacist"
                            }
                          >
                            {staff.role}
                          </span>
                        </td>
                        <td>{staff.email}</td>
                        <td>{staff.phone || "—"}</td>
                        <td>
                          <span className="badge badge-approved">
                            <CheckCircle2 size={11} /> Approved
                          </span>
                        </td>
                        <td>{new Date(staff.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
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
