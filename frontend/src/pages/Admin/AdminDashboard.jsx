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
  Search,
  MapPin,
  Award,
  FileText,
  Trash2,
  LayoutGrid,
  List,
  Mail,
  Phone,
  UserX,
} from "lucide-react";

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [pendingPharmacists, setPendingPharmacists] = useState([]);
  const [allStaff, setAllStaff] = useState([]);
  const [activeApprovalTab, setActiveApprovalTab] = useState("pending");
  const [approvalSearchQuery, setApprovalSearchQuery] = useState("");
  const [approveConfirmUser, setApproveConfirmUser] = useState(null);
  const [rejectModalUser, setRejectModalUser] = useState(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  // Doctor Management Specific State
  const [doctorManagementList, setDoctorManagementList] = useState([]);
  const [doctorViewMode, setDoctorViewMode] = useState("cards"); // "cards" | "table"
  const [doctorFilterStatus, setDoctorFilterStatus] = useState("pending"); // "pending" | "approved" | "all"
  const [doctorSearchQuery, setDoctorSearchQuery] = useState("");
  const [deleteConfirmDoctor, setDeleteConfirmDoctor] = useState(null);

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
        authService.getPendingApprovals().catch(() => ({ pendingDoctors: [], pendingPharmacists: [], pendingUsers: [] })),
        authService.getAllUsers().catch(() => ({ users: [] })),
      ]);

      if (patRes.success && patRes.patients) setPatients(patRes.patients);
      if (docRes.success && docRes.doctors) setDoctors(docRes.doctors);
      if (aptRes.success && aptRes.appointments) setAppointments(aptRes.appointments);
      if (invRes.success && invRes.invoices) setInvoices(invRes.invoices);

      if (pendingRes.success) {
        setPendingDoctors(pendingRes.pendingDoctors || []);
        setPendingPharmacists(pendingRes.pendingPharmacists || []);
      }

      if (usersRes.success && usersRes.users) {
        const staff = usersRes.users.filter((u) => {
          const r = (u.role || "").toLowerCase();
          return r === "doctor" || r === "pharmacist";
        });
        setAllStaff(staff);
      }

      // Build unified Doctor Management list from User accounts + Doctor directory
      const docMap = new Map();
      const allUsers = usersRes.users || [];
      const userDoctors = allUsers.filter((u) => (u.role || "").toLowerCase() === "doctor");

      userDoctors.forEach((u) => {
        const emailKey = (u.email || "").toLowerCase().trim();
        const isPending =
          u.status === "pending" ||
          u.approved === false ||
          (!u.status && (u.role || "").toLowerCase() === "doctor" && !u.approved);

        const effectiveStatus = isPending ? "pending" : (u.status || "approved");

        docMap.set(emailKey, {
          _id: u._id,
          userId: u._id,
          doctorId: null,
          name: u.name,
          email: u.email,
          role: u.role,
          specialization: u.specialization || u.department || "General Medicine",
          department: u.department || u.hospitalClinic || "General Medicine",
          phone: u.phone || "",
          licenseNumber: u.licenseNumber || "MED-Pending-Verification",
          qualification: u.qualification || "MD, MBBS",
          experience: u.experience || "",
          hospitalClinic: u.hospitalClinic || "",
          createdAt: u.createdAt,
          status: effectiveStatus,
          approved: effectiveStatus === "approved",
          avatar: u.avatar || "",
        });
      });

      // Overlay pendingDoctors explicitly from pending approvals API (guarantees pending doctors are visible)
      (pendingRes.pendingDoctors || []).forEach((p) => {
        const emailKey = (p.email || "").toLowerCase().trim();
        const existing = docMap.get(emailKey) || {};
        docMap.set(emailKey, {
          ...existing,
          _id: p._id || existing._id,
          userId: p._id || existing.userId,
          name: p.name || existing.name,
          email: p.email || existing.email,
          role: "Doctor",
          specialization: p.specialization || p.department || existing.specialization || "General Medicine",
          department: p.department || existing.department || "General Medicine",
          phone: p.phone || existing.phone || "",
          licenseNumber: p.licenseNumber || existing.licenseNumber || "N/A",
          qualification: p.qualification || existing.qualification || "MD, MBBS",
          experience: p.experience || existing.experience || "",
          hospitalClinic: p.hospitalClinic || existing.hospitalClinic || "",
          createdAt: p.createdAt || existing.createdAt,
          status: "pending",
          approved: false,
          avatar: p.avatar || existing.avatar || "",
        });
      });

      // Overlay directory doctors
      const directoryDoctors = docRes.doctors || [];
      directoryDoctors.forEach((d) => {
        const emailKey = (d.email || "").toLowerCase().trim();
        if (emailKey && docMap.has(emailKey)) {
          const existing = docMap.get(emailKey);
          // Never override pending status
          const effectiveStatus = existing.status === "pending"
            ? "pending"
            : (d.status || existing.status || "approved");

          docMap.set(emailKey, {
            ...existing,
            doctorId: d._id,
            avatar: existing.avatar || d.avatar || "",
            phone: existing.phone || d.phone || "",
            specialization: existing.specialization || d.specialty || d.department || "General Medicine",
            qualification: existing.qualification || d.qualifications || "MD, MBBS",
            licenseNumber: existing.licenseNumber || "N/A",
            status: effectiveStatus,
            approved: effectiveStatus === "approved",
          });
        } else if (emailKey) {
          const isPending = d.status === "pending";
          docMap.set(emailKey, {
            _id: d._id,
            doctorId: d._id,
            userId: d.userId || null,
            name: d.name,
            email: d.email,
            role: "Doctor",
            specialization: d.specialty || d.department || "General Medicine",
            department: d.department || "General Medicine",
            phone: d.phone || "",
            createdAt: d.createdAt,
            status: isPending ? "pending" : (d.status || "approved"),
            approved: !isPending,
            avatar: d.avatar || "",
            qualification: d.qualifications || "MD, MBBS",
            hospitalClinic: d.department || "",
            licenseNumber: "N/A",
          });
        }
      });

      setDoctorManagementList(Array.from(docMap.values()));
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleConfirmApprove = async () => {
    if (!approveConfirmUser) return;
    try {
      setActionLoading(approveConfirmUser._id);
      const res = await authService.updateUserStatus(approveConfirmUser._id, "approved");
      if (res.success) {
        setStatusMessage({
          type: "success",
          text: `Account for ${approveConfirmUser.name} (${approveConfirmUser.role}) has been approved successfully.`,
        });
        setApproveConfirmUser(null);
        await loadData();
      }
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to approve account.",
      });
    } finally {
      setActionLoading(null);
      setTimeout(() => {
        setStatusMessage(null);
      }, 5000);
    }
  };

  const handleApproveDoctorDirect = async (docItem) => {
    try {
      setActionLoading(docItem._id);
      const targetId = docItem.userId || docItem._id;
      const res = await authService.updateUserStatus(targetId, "approved");
      if (res.success) {
        setDoctorManagementList((prev) =>
          prev.map((d) =>
            d._id === docItem._id || (d.email && docItem.email && d.email.toLowerCase() === docItem.email.toLowerCase())
              ? { ...d, status: "approved", approved: true }
              : d
          )
        );
        setPendingDoctors((prev) =>
          prev.filter((p) => p._id !== targetId && (p.email && docItem.email ? p.email.toLowerCase() !== docItem.email.toLowerCase() : true))
        );
        setAllStaff((prev) =>
          prev.map((s) =>
            s._id === targetId
              ? { ...s, status: "approved" }
              : s
          )
        );
        setStatusMessage({
          type: "success",
          text: `Doctor account for '${docItem.name}' has been approved! They can now log in.`,
        });
        await loadData();
      }
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to approve doctor.",
      });
    } finally {
      setActionLoading(null);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const handleConfirmDeleteDoctor = async () => {
    if (!deleteConfirmDoctor) return;
    const target = deleteConfirmDoctor;
    try {
      setActionLoading(target._id);

      const targetId = target.userId || target.doctorId || target._id;

      // Call delete endpoint
      try {
        await authService.deleteUser(targetId);
      } catch (authErr) {
        if (target.doctorId) {
          await doctorService.delete(target.doctorId);
        } else {
          throw authErr;
        }
      }

      // Immediate UI update without page reload
      setDoctorManagementList((prev) =>
        prev.filter((d) => d._id !== target._id && d.email.toLowerCase() !== target.email.toLowerCase())
      );
      setDoctors((prev) =>
        prev.filter((d) => d._id !== target.doctorId && (d.email || "").toLowerCase() !== target.email.toLowerCase())
      );
      setAllStaff((prev) =>
        prev.filter((u) => u._id !== target.userId && (u.email || "").toLowerCase() !== target.email.toLowerCase())
      );
      setPendingDoctors((prev) =>
        prev.filter((u) => u._id !== target.userId && (u.email || "").toLowerCase() !== target.email.toLowerCase())
      );

      setStatusMessage({
        type: "success",
        text: `Doctor account '${target.name}' has been permanently deleted from the database.`,
      });

      setDeleteConfirmDoctor(null);
      // Background sync
      loadData();
    } catch (err) {
      console.error("Error deleting doctor account:", err);
      setStatusMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to delete doctor account.",
      });
    } finally {
      setActionLoading(null);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectModalUser) return;
    try {
      setActionLoading(rejectModalUser._id);
      const res = await authService.updateUserStatus(
        rejectModalUser._id,
        "rejected",
        rejectionReasonInput
      );
      if (res.success) {
        setDoctorManagementList((prev) =>
          prev.map((d) =>
            d._id === rejectModalUser._id || d.userId === rejectModalUser._id || (d.email && rejectModalUser.email && d.email.toLowerCase() === rejectModalUser.email.toLowerCase())
              ? { ...d, status: "rejected", approved: false }
              : d
          )
        );
        setPendingDoctors((prev) =>
          prev.filter((p) => p._id !== rejectModalUser._id && (p.email && rejectModalUser.email ? p.email.toLowerCase() !== rejectModalUser.email.toLowerCase() : true))
        );
        setAllStaff((prev) =>
          prev.map((s) =>
            s._id === rejectModalUser._id
              ? { ...s, status: "rejected" }
              : s
          )
        );
        setStatusMessage({
          type: "info",
          text: `Registration for ${rejectModalUser.name} (${rejectModalUser.role}) has been marked as rejected.`,
        });
        setRejectModalUser(null);
        setRejectionReasonInput("");
        await loadData();
      }
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to reject account.",
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
      {(() => {
        const pendingCount = allStaff.filter((u) => u.status === "pending").length;
        const approvedCount = allStaff.filter(
          (u) => u.status === "approved" || (!u.status && u.role)
        ).length;
        const rejectedCount = allStaff.filter((u) => u.status === "rejected").length;
        const doctorsCount = allStaff.filter(
          (u) => (u.role || "").toLowerCase() === "doctor"
        ).length;
        const pharmacistsCount = allStaff.filter(
          (u) => (u.role || "").toLowerCase() === "pharmacist"
        ).length;

        let displayedStaff = [...allStaff];
        if (activeApprovalTab === "pending") {
          displayedStaff = displayedStaff.filter((u) => u.status === "pending");
        } else if (activeApprovalTab === "approved") {
          displayedStaff = displayedStaff.filter(
            (u) => u.status === "approved" || (!u.status && u.role)
          );
        } else if (activeApprovalTab === "rejected") {
          displayedStaff = displayedStaff.filter((u) => u.status === "rejected");
        } else if (activeApprovalTab === "doctors") {
          displayedStaff = displayedStaff.filter(
            (u) => (u.role || "").toLowerCase() === "doctor"
          );
        } else if (activeApprovalTab === "pharmacists") {
          displayedStaff = displayedStaff.filter(
            (u) => (u.role || "").toLowerCase() === "pharmacist"
          );
        }

        if (approvalSearchQuery.trim()) {
          const q = approvalSearchQuery.toLowerCase();
          displayedStaff = displayedStaff.filter(
            (u) =>
              (u.name || "").toLowerCase().includes(q) ||
              (u.email || "").toLowerCase().includes(q) ||
              (u.licenseNumber || "").toLowerCase().includes(q) ||
              (u.hospitalClinic || "").toLowerCase().includes(q) ||
              (u.pharmacyName || "").toLowerCase().includes(q) ||
              (u.specialization || "").toLowerCase().includes(q) ||
              (u.qualification || "").toLowerCase().includes(q)
          );
        }

        const filterTabs = [
          { id: "all", label: "All Staff", count: allStaff.length },
          { id: "pending", label: "Pending Approvals", count: pendingCount, highlight: pendingCount > 0 },
          { id: "approved", label: "Approved", count: approvedCount },
          { id: "rejected", label: "Rejected", count: rejectedCount },
          { id: "doctors", label: "Doctors", count: doctorsCount },
          { id: "pharmacists", label: "Pharmacists", count: pharmacistsCount },
        ];

        return (
          <div
            className="card"
            style={{
              marginBottom: "32px",
              border: pendingCount > 0 ? "1px solid #fde68a" : "1px solid var(--border-color)",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: "16px",
                marginBottom: "20px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: pendingCount > 0 ? "#fffbeb" : "#ecfdf5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: pendingCount > 0 ? "#b45309" : "var(--emerald-600)",
                    border: pendingCount > 0 ? "1px solid #fde68a" : "1px solid #a7f3d0",
                  }}
                >
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--slate-900)" }}>
                    Clinical Staff Credentialing & Pending Approvals
                  </h3>
                  <p style={{ fontSize: "0.8125rem", color: "var(--slate-500)", marginTop: "2px" }}>
                    Verify licenses, credentials, and approve Doctor & Pharmacist access before EHR login.
                  </p>
                </div>
              </div>

              {/* Search Box */}
              <div style={{ position: "relative", minWidth: "260px" }}>
                <Search
                  size={16}
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--slate-400)",
                  }}
                />
                <input
                  type="text"
                  className="form-input"
                  value={approvalSearchQuery}
                  onChange={(e) => setApprovalSearchQuery(e.target.value)}
                  placeholder="Search name, license, clinic, specialty..."
                  style={{ paddingLeft: "36px", fontSize: "0.8125rem" }}
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                background: "var(--slate-100)",
                padding: "4px",
                borderRadius: "var(--radius-md)",
                gap: "4px",
                marginBottom: "20px",
              }}
            >
              {filterTabs.map((tab) => {
                const isActive = activeApprovalTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveApprovalTab(tab.id)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.8125rem",
                      fontWeight: 700,
                      background: isActive ? "#ffffff" : "transparent",
                      color: isActive ? "var(--slate-900)" : "var(--slate-600)",
                      boxShadow: isActive ? "var(--shadow-sm)" : "none",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span>{tab.label}</span>
                    <span
                      style={{
                        background:
                          tab.highlight && tab.count > 0
                            ? "#f59e0b"
                            : isActive
                            ? "var(--primary-600)"
                            : "var(--slate-300)",
                        color: "#ffffff",
                        fontSize: "0.6875rem",
                        padding: "1px 7px",
                        borderRadius: "9999px",
                        fontWeight: 700,
                      }}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Table Content */}
            {displayedStaff.length === 0 ? (
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
                  No Staff Records Found in Current View
                </h4>
                <p style={{ color: "var(--slate-500)", fontSize: "0.875rem", marginTop: "4px" }}>
                  {activeApprovalTab === "pending"
                    ? "All physician and pharmacy staff credentials have been reviewed."
                    : "No staff records match the current filter or search criteria."}
                </p>
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Staff / Practitioner</th>
                      <th>Clinical Dept / Pharmacy</th>
                      <th>License & Qualifications</th>
                      <th>Experience</th>
                      <th>Registered On</th>
                      <th>Status</th>
                      <th style={{ textAlign: "right" }}>Approval Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedStaff.map((staff) => {
                      const isDoctor = (staff.role || "").toLowerCase() === "doctor";
                      const effectiveStatus = staff.status || "approved";

                      return (
                        <tr key={staff._id}>
                          {/* 1. Name, Role & Email */}
                          <td>
                            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                              <div
                                style={{
                                  width: "34px",
                                  height: "34px",
                                  borderRadius: "50%",
                                  background: isDoctor ? "#e0f2fe" : "#fae8ff",
                                  color: isDoctor ? "#0369a1" : "#a21caf",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: 800,
                                  fontSize: "0.75rem",
                                  flexShrink: 0,
                                  marginTop: "2px",
                                }}
                              >
                                {isDoctor ? "Dr" : "Rx"}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, color: "var(--slate-900)" }}>
                                  {staff.name}
                                </div>
                                <div style={{ fontSize: "0.75rem", color: "var(--slate-500)" }}>
                                  {staff.email}
                                </div>
                                {staff.phone && (
                                  <div style={{ fontSize: "0.6875rem", color: "var(--slate-400)" }}>
                                    ☎ {staff.phone}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* 2. Specialization or Pharmacy details */}
                          <td>
                            {isDoctor ? (
                              <div>
                                <div style={{ fontWeight: 600, color: "var(--slate-800)" }}>
                                  {staff.specialization || staff.department || "General Medicine"}
                                </div>
                                <div style={{ fontSize: "0.75rem", color: "var(--slate-500)" }}>
                                  🏥 {staff.hospitalClinic || staff.department || "Main Outpatient Clinic"}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div style={{ fontWeight: 600, color: "var(--slate-800)" }}>
                                  {staff.pharmacyName || "Hospital Dispensary"}
                                </div>
                                <div style={{ fontSize: "0.75rem", color: "var(--slate-500)" }}>
                                  📍 {staff.pharmacyAddress || "Main Hospital Pharmacy"}
                                </div>
                              </div>
                            )}
                          </td>

                          {/* 3. License & Qualifications */}
                          <td>
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                              <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--slate-800)" }}>
                                {staff.qualification || (isDoctor ? "MD, MBBS" : "B.Pharm")}
                              </div>
                              <div
                                style={{
                                  fontSize: "0.75rem",
                                  color: "var(--primary-700)",
                                  fontWeight: 600,
                                }}
                              >
                                Reg: {staff.licenseNumber || "Verified Staff"}
                              </div>
                            </div>
                          </td>

                          {/* 4. Years of Experience */}
                          <td>
                            <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--slate-700)" }}>
                              {staff.experience || "—"}
                            </span>
                          </td>

                          {/* 5. Registered Date */}
                          <td>
                            <span style={{ fontSize: "0.8125rem", color: "var(--slate-600)" }}>
                              {staff.createdAt ? new Date(staff.createdAt).toLocaleDateString() : "Active"}
                            </span>
                          </td>

                          {/* 6. Status Badge */}
                          <td>
                            {effectiveStatus === "pending" && (
                              <span className="badge badge-pending">
                                <Clock size={11} /> Pending Approval
                              </span>
                            )}
                            {effectiveStatus === "approved" && (
                              <span className="badge badge-approved">
                                <CheckCircle2 size={11} /> Approved
                              </span>
                            )}
                            {effectiveStatus === "rejected" && (
                              <div>
                                <span
                                  className="badge"
                                  style={{
                                    background: "#fef2f2",
                                    color: "var(--rose-600)",
                                    border: "1px solid #fecdd3",
                                  }}
                                >
                                  <XCircle size={11} /> Rejected
                                </span>
                                {staff.rejectionReason && (
                                  <div
                                    style={{
                                      fontSize: "0.6875rem",
                                      color: "var(--rose-700)",
                                      marginTop: "4px",
                                      maxWidth: "180px",
                                    }}
                                  >
                                    Note: {staff.rejectionReason}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>

                          {/* 7. Credential Actions */}
                          <td style={{ textAlign: "right" }}>
                            <div style={{ display: "inline-flex", gap: "8px" }}>
                              {effectiveStatus === "pending" && (
                                <>
                                  <button
                                    onClick={() => setApproveConfirmUser(staff)}
                                    disabled={actionLoading === staff._id}
                                    className="btn btn-sm"
                                    style={{
                                      background: "#ecfdf5",
                                      color: "var(--emerald-700)",
                                      border: "1px solid #a7f3d0",
                                      fontWeight: 700,
                                      gap: "4px",
                                    }}
                                    title="Approve Practitioner Account"
                                  >
                                    <CheckCircle2 size={14} /> Approve
                                  </button>
                                  <button
                                    onClick={() => {
                                      setRejectModalUser(staff);
                                      setRejectionReasonInput("");
                                    }}
                                    disabled={actionLoading === staff._id}
                                    className="btn btn-sm"
                                    style={{
                                      background: "#fef2f2",
                                      color: "var(--rose-700)",
                                      border: "1px solid #fecdd3",
                                      fontWeight: 700,
                                      gap: "4px",
                                    }}
                                    title="Reject Practitioner Account"
                                  >
                                    <XCircle size={14} /> Reject
                                  </button>
                                </>
                              )}

                              {effectiveStatus === "approved" && (
                                <button
                                  onClick={() => {
                                    setRejectModalUser(staff);
                                    setRejectionReasonInput("");
                                  }}
                                  disabled={actionLoading === staff._id}
                                  className="btn btn-sm"
                                  style={{
                                    background: "#fef2f2",
                                    color: "var(--rose-600)",
                                    border: "1px solid #fecdd3",
                                    fontSize: "0.75rem",
                                  }}
                                  title="Revoke and Reject this account"
                                >
                                  Revoke
                                </button>
                              )}

                              {effectiveStatus === "rejected" && (
                                <button
                                  onClick={() => setApproveConfirmUser(staff)}
                                  disabled={actionLoading === staff._id}
                                  className="btn btn-sm"
                                  style={{
                                    background: "#ecfdf5",
                                    color: "var(--emerald-700)",
                                    border: "1px solid #a7f3d0",
                                    fontSize: "0.75rem",
                                  }}
                                  title="Re-approve this account"
                                >
                                  Re-Approve
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })()}

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

      {/* Enhanced Doctor Management Section */}
      {(() => {
        const pendingDocs = doctorManagementList.filter(
          (d) => (d.status === "pending" || d.approved === false) && d.status !== "rejected"
        );
        const approvedDocs = doctorManagementList.filter(
          (d) => (d.status === "approved" || (!d.status && d.approved === true)) && d.status !== "pending" && d.status !== "rejected"
        );
        const rejectedDocs = doctorManagementList.filter((d) => d.status === "rejected");

        let filteredDoctors = [...doctorManagementList];
        if (doctorFilterStatus === "pending") {
          filteredDoctors = pendingDocs;
        } else if (doctorFilterStatus === "approved") {
          filteredDoctors = approvedDocs;
        } else if (doctorFilterStatus === "rejected") {
          filteredDoctors = rejectedDocs;
        }

        if (doctorSearchQuery.trim()) {
          const q = doctorSearchQuery.toLowerCase();
          filteredDoctors = filteredDoctors.filter(
            (d) =>
              (d.name || "").toLowerCase().includes(q) ||
              (d.email || "").toLowerCase().includes(q) ||
              (d.specialization || "").toLowerCase().includes(q) ||
              (d.licenseNumber || "").toLowerCase().includes(q) ||
              (d.phone || "").toLowerCase().includes(q)
          );
        }

        const docTabs = [
          { id: "pending", label: "Pending Doctors", count: pendingDocs.length, highlight: pendingDocs.length > 0 },
          { id: "approved", label: "Approved Doctors", count: approvedDocs.length },
          { id: "all", label: "All Doctors", count: doctorManagementList.length },
        ];

        return (
          <div
            className="card"
            style={{
              marginBottom: "32px",
              border: pendingDocs.length > 0 ? "1px solid #fde68a" : "1px solid var(--border-color)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            {/* Header: Title, Search, View Mode Toggle */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "16px",
                marginBottom: "20px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: pendingDocs.length > 0 ? "#fffbeb" : "#e0f2fe",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: pendingDocs.length > 0 ? "#b45309" : "var(--primary-700)",
                    border: pendingDocs.length > 0 ? "1px solid #fde68a" : "1px solid #bae6fd",
                  }}
                >
                  <Stethoscope size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--slate-900)" }}>
                    Doctor Approval & Management
                  </h3>
                  <p style={{ fontSize: "0.8125rem", color: "var(--slate-500)", marginTop: "2px" }}>
                    Review pending physician applications, verify medical licenses, and authorize EHR portal access.
                  </p>
                </div>
              </div>

              {/* Search & View Controls */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                {/* Search Bar */}
                <div style={{ position: "relative", minWidth: "260px" }}>
                  <Search
                    size={16}
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--slate-400)",
                    }}
                  />
                  <input
                    type="text"
                    className="form-input"
                    value={doctorSearchQuery}
                    onChange={(e) => setDoctorSearchQuery(e.target.value)}
                    placeholder="Search doctor, email, license, specialty..."
                    style={{ paddingLeft: "36px", fontSize: "0.8125rem" }}
                  />
                </div>

                {/* View Switcher (Cards / Table) */}
                <div
                  style={{
                    display: "flex",
                    background: "var(--slate-100)",
                    padding: "3px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <button
                    onClick={() => setDoctorViewMode("cards")}
                    style={{
                      padding: "6px 10px",
                      borderRadius: "var(--radius-sm)",
                      border: "none",
                      background: doctorViewMode === "cards" ? "#ffffff" : "transparent",
                      color: doctorViewMode === "cards" ? "var(--primary-700)" : "var(--slate-600)",
                      boxShadow: doctorViewMode === "cards" ? "var(--shadow-sm)" : "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                    }}
                    title="Card Grid View"
                  >
                    <LayoutGrid size={15} />
                    <span>Cards</span>
                  </button>
                  <button
                    onClick={() => setDoctorViewMode("table")}
                    style={{
                      padding: "6px 10px",
                      borderRadius: "var(--radius-sm)",
                      border: "none",
                      background: doctorViewMode === "table" ? "#ffffff" : "transparent",
                      color: doctorViewMode === "table" ? "var(--primary-700)" : "var(--slate-600)",
                      boxShadow: doctorViewMode === "table" ? "var(--shadow-sm)" : "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                    }}
                    title="Table View"
                  >
                    <List size={15} />
                    <span>Table</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                background: "var(--slate-100)",
                padding: "4px",
                borderRadius: "var(--radius-md)",
                gap: "4px",
                marginBottom: "20px",
              }}
            >
              {docTabs.map((tab) => {
                const isActive = doctorFilterStatus === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setDoctorFilterStatus(tab.id)}
                    style={{
                      padding: "8px 18px",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.8125rem",
                      fontWeight: 700,
                      background: isActive ? "#ffffff" : "transparent",
                      color: isActive ? "var(--slate-900)" : "var(--slate-600)",
                      boxShadow: isActive ? "var(--shadow-sm)" : "none",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span>{tab.label}</span>
                    <span
                      style={{
                        background:
                          tab.highlight && tab.count > 0
                            ? "#f59e0b"
                            : isActive
                            ? "var(--primary-600)"
                            : "var(--slate-300)",
                        color: "#ffffff",
                        fontSize: "0.6875rem",
                        padding: "1px 8px",
                        borderRadius: "9999px",
                        fontWeight: 700,
                      }}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Empty State */}
            {filteredDoctors.length === 0 ? (
              <div
                style={{
                  padding: "48px 24px",
                  textAlign: "center",
                  background: "var(--slate-50)",
                  borderRadius: "var(--radius-md)",
                  border: "1px dashed var(--border-color)",
                }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    background: doctorFilterStatus === "pending" ? "#ecfdf5" : "#e0f2fe",
                    color: doctorFilterStatus === "pending" ? "var(--emerald-600)" : "var(--primary-600)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 12px",
                  }}
                >
                  {doctorFilterStatus === "pending" ? <CheckCircle2 size={28} /> : <Stethoscope size={28} />}
                </div>
                <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--slate-800)" }}>
                  {doctorFilterStatus === "pending" ? "No Pending Doctor Registrations" : "No Doctor Accounts Found"}
                </h4>
                <p style={{ color: "var(--slate-500)", fontSize: "0.875rem", marginTop: "4px", maxWidth: "420px", margin: "4px auto 0" }}>
                  {doctorFilterStatus === "pending"
                    ? "All physician registration applications have been reviewed and approved."
                    : "No doctor records match the current filter or search criteria."}
                </p>
              </div>
            ) : doctorViewMode === "cards" ? (
              /* Cards View */
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                  gap: "20px",
                }}
              >
                {filteredDoctors.map((doc) => {
                  const isRejected = doc.status === "rejected";
                  const isPending = !isRejected && (doc.status === "pending" || doc.approved === false);
                  const isApproved = !isRejected && !isPending && (doc.status === "approved" || doc.approved === true || !doc.status);

                  return (
                    <div
                      key={doc._id}
                      style={{
                        background: "#ffffff",
                        border: isPending ? "1px solid #fde68a" : "1px solid var(--border-color)",
                        borderRadius: "var(--radius-lg)",
                        padding: "20px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        transition: "all 0.2s ease",
                        boxShadow: isPending ? "0 4px 14px -2px rgba(245, 158, 11, 0.15)" : "var(--shadow-sm)",
                      }}
                    >
                      {/* Top Row: Avatar, Name, Specialty, and Status Badge */}
                      <div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            marginBottom: "14px",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            {doc.avatar ? (
                              <img
                                src={doc.avatar}
                                alt={doc.name}
                                style={{
                                  width: "48px",
                                  height: "48px",
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                  border: "2px solid #e0f2fe",
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: "48px",
                                  height: "48px",
                                  borderRadius: "50%",
                                  background: isPending ? "#fef3c7" : "#e0f2fe",
                                  color: isPending ? "#b45309" : "#0369a1",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: 800,
                                  fontSize: "0.875rem",
                                  border: isPending ? "2px solid #fde68a" : "2px solid #bae6fd",
                                }}
                              >
                                Dr
                              </div>
                            )}
                            <div>
                              <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--slate-900)", margin: 0 }}>
                                {doc.name.startsWith("Dr.") ? doc.name : `Dr. ${doc.name}`}
                              </h4>
                              <span
                                style={{
                                  display: "inline-block",
                                  fontSize: "0.75rem",
                                  color: "var(--primary-700)",
                                  fontWeight: 600,
                                  marginTop: "2px",
                                }}
                              >
                                {doc.specialization || "General Medicine"}
                              </span>
                            </div>
                          </div>

                          {/* Status Badge */}
                          {isPending && (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                padding: "4px 10px",
                                borderRadius: "9999px",
                                background: "#fffbeb",
                                border: "1px solid #fde68a",
                                color: "#b45309",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                              }}
                            >
                              <Clock size={12} /> Pending Approval
                            </span>
                          )}
                          {isApproved && (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                padding: "4px 10px",
                                borderRadius: "9999px",
                                background: "#ecfdf5",
                                border: "1px solid #a7f3d0",
                                color: "var(--emerald-700)",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                              }}
                            >
                              <CheckCircle2 size={12} /> Approved
                            </span>
                          )}
                          {isRejected && (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                padding: "4px 10px",
                                borderRadius: "9999px",
                                background: "#fef2f2",
                                border: "1px solid #fecdd3",
                                color: "var(--rose-700)",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                              }}
                            >
                              <XCircle size={12} /> Rejected
                            </span>
                          )}
                        </div>

                        {/* Doctor Card Details: Full Name, Email, Specialization, License Number, Registration Date */}
                        <div
                          style={{
                            background: "var(--slate-50)",
                            padding: "14px",
                            borderRadius: "var(--radius-md)",
                            fontSize: "0.8125rem",
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                            marginBottom: "16px",
                          }}
                        >
                          {/* Email */}
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--slate-700)" }}>
                            <Mail size={14} color="var(--slate-400)" style={{ flexShrink: 0 }} />
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {doc.email}
                            </span>
                          </div>

                          {/* Specialization & Hospital */}
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--slate-700)" }}>
                            <Stethoscope size={14} color="var(--primary-600)" style={{ flexShrink: 0 }} />
                            <span>
                              <strong>Specialization:</strong> {doc.specialization || "General Medicine"}
                            </span>
                          </div>

                          {/* License Number */}
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--slate-700)" }}>
                            <Award size={14} color="var(--primary-600)" style={{ flexShrink: 0 }} />
                            <span>
                              <strong>License No:</strong>{" "}
                              <span
                                style={{
                                  background: "#f1f5f9",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  fontWeight: 700,
                                  color: "var(--slate-800)",
                                }}
                              >
                                {doc.licenseNumber && doc.licenseNumber !== "N/A"
                                  ? doc.licenseNumber
                                  : "MED-Pending-Verification"}
                              </span>
                            </span>
                          </div>

                          {/* Phone number */}
                          {doc.phone && (
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--slate-700)" }}>
                              <Phone size={14} color="var(--slate-400)" style={{ flexShrink: 0 }} />
                              <span>{doc.phone}</span>
                            </div>
                          )}

                          {/* Registration Date */}
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--slate-500)", fontSize: "0.75rem" }}>
                            <Calendar size={14} color="var(--slate-400)" style={{ flexShrink: 0 }} />
                            <span>
                              Registered:{" "}
                              <strong>
                                {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : "Pending Verification"}
                              </strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "14px", marginTop: "4px" }}>
                        {isPending && (
                          <div style={{ display: "flex", gap: "10px" }}>
                            {/* Visible Green Approve Button */}
                            <button
                              onClick={() => handleApproveDoctorDirect(doc)}
                              disabled={actionLoading === doc._id}
                              className="btn btn-sm"
                              style={{
                                flex: 1,
                                background: "#10b981",
                                borderColor: "#059669",
                                color: "#ffffff",
                                fontWeight: 700,
                                justifyContent: "center",
                                gap: "6px",
                                padding: "9px 16px",
                                fontSize: "0.875rem",
                                borderRadius: "var(--radius-md)",
                                boxShadow: "0 2px 6px rgba(16, 185, 129, 0.3)",
                                cursor: "pointer",
                              }}
                              title="Approve Doctor Account"
                            >
                              <CheckCircle2 size={16} />
                              {actionLoading === doc._id ? "Approving..." : "Approve"}
                            </button>

                            {/* Visible Red Reject Button */}
                            <button
                              onClick={() => {
                                setRejectModalUser({ _id: doc.userId || doc._id, name: doc.name, role: "Doctor", email: doc.email });
                                setRejectionReasonInput("");
                              }}
                              disabled={actionLoading === doc._id}
                              className="btn btn-sm"
                              style={{
                                flex: 1,
                                background: "#ef4444",
                                borderColor: "#dc2626",
                                color: "#ffffff",
                                fontWeight: 700,
                                justifyContent: "center",
                                gap: "6px",
                                padding: "9px 16px",
                                fontSize: "0.875rem",
                                borderRadius: "var(--radius-md)",
                                boxShadow: "0 2px 6px rgba(239, 68, 68, 0.3)",
                                cursor: "pointer",
                              }}
                              title="Reject Doctor Registration"
                            >
                              <XCircle size={16} /> Reject
                            </button>
                          </div>
                        )}

                        {isApproved && (
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "0.75rem", color: "var(--emerald-600)", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                              <CheckCircle2 size={14} /> Active Practitioner
                            </span>
                            <button
                              onClick={() => setDeleteConfirmDoctor(doc)}
                              disabled={actionLoading === doc._id}
                              className="btn btn-sm"
                              style={{
                                background: "#fef2f2",
                                color: "var(--rose-600)",
                                border: "1px solid #fecdd3",
                                fontWeight: 600,
                                gap: "6px",
                                padding: "6px 12px",
                              }}
                              title="Delete Doctor Account"
                            >
                              <Trash2 size={14} /> Delete Doctor
                            </button>
                          </div>
                        )}

                        {isRejected && (
                          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                            <button
                              onClick={() => handleApproveDoctorDirect(doc)}
                              disabled={actionLoading === doc._id}
                              className="btn btn-sm"
                              style={{
                                background: "#10b981",
                                color: "#ffffff",
                                border: "none",
                                fontSize: "0.8125rem",
                                fontWeight: 700,
                                gap: "4px",
                                padding: "6px 12px",
                              }}
                            >
                              <CheckCircle2 size={14} /> Re-Approve
                            </button>
                            <button
                              onClick={() => setDeleteConfirmDoctor(doc)}
                              disabled={actionLoading === doc._id}
                              className="btn btn-sm"
                              style={{
                                background: "#fef2f2",
                                color: "var(--rose-600)",
                                border: "1px solid #fecdd3",
                                fontSize: "0.8125rem",
                                gap: "4px",
                                padding: "6px 12px",
                              }}
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Table View */
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Doctor Name</th>
                      <th>Email</th>
                      <th>Specialization</th>
                      <th>License Number</th>
                      <th>Phone Number</th>
                      <th>Registration Date</th>
                      <th>Account Status</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDoctors.map((doc) => {
                      const isRejected = doc.status === "rejected";
                      const isPending = !isRejected && (doc.status === "pending" || doc.approved === false);
                      const isApproved = !isRejected && !isPending && (doc.status === "approved" || doc.approved === true || !doc.status);

                      return (
                        <tr key={doc._id}>
                          {/* Doctor Name with Profile image */}
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              {doc.avatar ? (
                                <img
                                  src={doc.avatar}
                                  alt={doc.name}
                                  style={{
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    border: "1px solid #bae6fd",
                                    flexShrink: 0,
                                  }}
                                />
                              ) : (
                                <div
                                  style={{
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "50%",
                                    background: isPending ? "#fef3c7" : "#e0f2fe",
                                    color: isPending ? "#b45309" : "#0369a1",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: 800,
                                    fontSize: "0.75rem",
                                    flexShrink: 0,
                                  }}
                                >
                                  Dr
                                </div>
                              )}
                              <div style={{ fontWeight: 700, color: "var(--slate-900)" }}>
                                {doc.name.startsWith("Dr.") ? doc.name : `Dr. ${doc.name}`}
                              </div>
                            </div>
                          </td>

                          {/* Email */}
                          <td>
                            <span style={{ fontSize: "0.8125rem", color: "var(--slate-600)" }}>
                              {doc.email}
                            </span>
                          </td>

                          {/* Specialization */}
                          <td>
                            <span
                              style={{
                                fontSize: "0.8125rem",
                                fontWeight: 600,
                                color: "var(--primary-700)",
                                background: "#f0fdfa",
                                padding: "2px 8px",
                                borderRadius: "4px",
                              }}
                            >
                              {doc.specialization || "General Medicine"}
                            </span>
                          </td>

                          {/* License Number */}
                          <td>
                            <span
                              style={{
                                fontSize: "0.8125rem",
                                fontWeight: 700,
                                color: "var(--slate-700)",
                                background: "#f1f5f9",
                                padding: "2px 6px",
                                borderRadius: "4px",
                              }}
                            >
                              {doc.licenseNumber && doc.licenseNumber !== "N/A"
                                ? doc.licenseNumber
                                : "Pending"}
                            </span>
                          </td>

                          {/* Phone number */}
                          <td>
                            <span style={{ fontSize: "0.8125rem", color: "var(--slate-700)" }}>
                              {doc.phone || "—"}
                            </span>
                          </td>

                          {/* Registration Date */}
                          <td>
                            <span style={{ fontSize: "0.8125rem", color: "var(--slate-600)" }}>
                              {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : "Active"}
                            </span>
                          </td>

                          {/* Account Status */}
                          <td>
                            {isPending && (
                              <span className="badge badge-pending">
                                <Clock size={11} /> Pending
                              </span>
                            )}
                            {isApproved && (
                              <span className="badge badge-approved">
                                <CheckCircle2 size={11} /> Approved
                              </span>
                            )}
                            {isRejected && (
                              <span
                                className="badge"
                                style={{
                                  background: "#fef2f2",
                                  color: "var(--rose-600)",
                                  border: "1px solid #fecdd3",
                                }}
                              >
                                <XCircle size={11} /> Rejected
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td style={{ textAlign: "right" }}>
                            <div style={{ display: "inline-flex", gap: "8px" }}>
                              {isPending && (
                                <>
                                  <button
                                    onClick={() => handleApproveDoctorDirect(doc)}
                                    disabled={actionLoading === doc._id}
                                    className="btn btn-sm"
                                    style={{
                                      background: "#10b981",
                                      color: "#ffffff",
                                      border: "none",
                                      fontWeight: 700,
                                      gap: "4px",
                                      padding: "6px 12px",
                                    }}
                                    title="Approve Doctor"
                                  >
                                    <CheckCircle2 size={13} /> Approve
                                  </button>
                                  <button
                                    onClick={() => {
                                      setRejectModalUser({ _id: doc.userId || doc._id, name: doc.name, role: "Doctor", email: doc.email });
                                      setRejectionReasonInput("");
                                    }}
                                    disabled={actionLoading === doc._id}
                                    className="btn btn-sm"
                                    style={{
                                      background: "#ef4444",
                                      color: "#ffffff",
                                      border: "none",
                                      fontWeight: 700,
                                      gap: "4px",
                                      padding: "6px 12px",
                                    }}
                                    title="Reject Doctor"
                                  >
                                    <XCircle size={13} /> Reject
                                  </button>
                                </>
                              )}

                              {isApproved && (
                                <button
                                  onClick={() => setDeleteConfirmDoctor(doc)}
                                  disabled={actionLoading === doc._id}
                                  className="btn btn-sm"
                                  style={{
                                    background: "#fef2f2",
                                    color: "var(--rose-600)",
                                    border: "1px solid #fecdd3",
                                    fontWeight: 600,
                                    gap: "4px",
                                  }}
                                  title="Delete Doctor Account"
                                >
                                  <Trash2 size={13} /> Delete
                                </button>
                              )}

                              {isRejected && (
                                <button
                                  onClick={() => setDeleteConfirmDoctor(doc)}
                                  disabled={actionLoading === doc._id}
                                  className="btn btn-sm"
                                  style={{
                                    background: "#fef2f2",
                                    color: "var(--rose-600)",
                                    border: "1px solid #fecdd3",
                                    gap: "4px",
                                  }}
                                  title="Delete Doctor Account"
                                >
                                  <Trash2 size={13} /> Delete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })()}

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

      {/* Confirmation Modal: Approve Account */}
      <Modal
        isOpen={Boolean(approveConfirmUser)}
        onClose={() => setApproveConfirmUser(null)}
        title={`Authorize ${approveConfirmUser?.role || "Staff"} Account`}
      >
        {approveConfirmUser && (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "16px",
                background: "#ecfdf5",
                padding: "12px 16px",
                borderRadius: "var(--radius-md)",
                border: "1px solid #a7f3d0",
              }}
            >
              <CheckCircle2 size={24} color="var(--emerald-600)" />
              <div>
                <strong style={{ color: "var(--slate-900)" }}>
                  Authorize {approveConfirmUser.name}
                </strong>
                <p style={{ fontSize: "0.8125rem", color: "var(--slate-600)", margin: 0 }}>
                  Role: {approveConfirmUser.role} • Status will transition to Approved
                </p>
              </div>
            </div>

            <p style={{ fontSize: "0.875rem", color: "var(--slate-600)", lineHeight: 1.6, marginBottom: "16px" }}>
              Are you sure you want to approve this {approveConfirmUser.role}? The user will immediately be granted authorization to log in to the Medicare Portal and access EHR data.
            </p>

            <div
              style={{
                background: "var(--slate-50)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-md)",
                padding: "12px 16px",
                marginBottom: "20px",
                fontSize: "0.8125rem",
              }}
            >
              <div><strong>Email:</strong> {approveConfirmUser.email}</div>
              {approveConfirmUser.phone && <div><strong>Phone:</strong> {approveConfirmUser.phone}</div>}
              {approveConfirmUser.licenseNumber && (
                <div><strong>License / Reg No:</strong> {approveConfirmUser.licenseNumber}</div>
              )}
              {approveConfirmUser.qualification && (
                <div><strong>Qualification:</strong> {approveConfirmUser.qualification}</div>
              )}
              {approveConfirmUser.specialization && (
                <div><strong>Specialty:</strong> {approveConfirmUser.specialization}</div>
              )}
              {approveConfirmUser.pharmacyName && (
                <div><strong>Pharmacy:</strong> {approveConfirmUser.pharmacyName}</div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                className="btn btn-secondary"
                onClick={() => setApproveConfirmUser(null)}
                disabled={Boolean(actionLoading)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                style={{ background: "var(--emerald-600)", borderColor: "var(--emerald-600)", gap: "6px" }}
                onClick={handleConfirmApprove}
                disabled={Boolean(actionLoading)}
              >
                <CheckCircle2 size={16} />
                {actionLoading ? "Approving..." : "Confirm & Authorize Account"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Rejection Modal with Optional Reason */}
      <Modal
        isOpen={Boolean(rejectModalUser)}
        onClose={() => {
          setRejectModalUser(null);
          setRejectionReasonInput("");
        }}
        title={`Reject ${rejectModalUser?.role || "Staff"} Registration`}
      >
        {rejectModalUser && (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "16px",
                background: "#fef2f2",
                padding: "12px 16px",
                borderRadius: "var(--radius-md)",
                border: "1px solid #fecdd3",
              }}
            >
              <XCircle size={24} color="var(--rose-600)" />
              <div>
                <strong style={{ color: "var(--slate-900)" }}>
                  Reject Application for {rejectModalUser.name}
                </strong>
                <p style={{ fontSize: "0.8125rem", color: "var(--slate-600)", margin: 0 }}>
                  The user will be denied login access.
                </p>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label className="form-label">
                Reason for Rejection (Optional)
              </label>
              <textarea
                className="form-input"
                rows={3}
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                placeholder="e.g. Medical license could not be verified with state board, incomplete credentials, or invalid documentation..."
                style={{ resize: "vertical" }}
              />
              <span style={{ fontSize: "0.75rem", color: "var(--slate-500)", display: "block", marginTop: "4px" }}>
                If provided, this reason will be displayed to the user when they attempt to log in.
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setRejectModalUser(null);
                  setRejectionReasonInput("");
                }}
                disabled={Boolean(actionLoading)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                style={{
                  background: "var(--rose-600)",
                  borderColor: "var(--rose-600)",
                  color: "#ffffff",
                  gap: "6px",
                }}
                onClick={handleConfirmReject}
                disabled={Boolean(actionLoading)}
              >
                <XCircle size={16} />
                {actionLoading ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation Modal: Delete Doctor Account */}
      <Modal
        isOpen={Boolean(deleteConfirmDoctor)}
        onClose={() => setDeleteConfirmDoctor(null)}
        title="Delete Doctor Account"
      >
        {deleteConfirmDoctor && (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                marginBottom: "18px",
                background: "#fef2f2",
                padding: "14px 16px",
                borderRadius: "var(--radius-md)",
                border: "1px solid #fecdd3",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  background: "#fee2e2",
                  color: "var(--rose-600)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Trash2 size={22} />
              </div>
              <div>
                <strong style={{ color: "var(--slate-900)", fontSize: "1rem" }}>
                  Are you sure you want to delete this doctor account?
                </strong>
                <p style={{ fontSize: "0.8125rem", color: "var(--slate-600)", marginTop: "2px" }}>
                  This action is permanent and will remove the doctor from Medicare.
                </p>
              </div>
            </div>

            <div
              style={{
                background: "var(--slate-50)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-md)",
                padding: "14px 16px",
                marginBottom: "16px",
                fontSize: "0.875rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                {deleteConfirmDoctor.avatar ? (
                  <img
                    src={deleteConfirmDoctor.avatar}
                    alt={deleteConfirmDoctor.name}
                    style={{ width: "38px", height: "38px", borderRadius: "50%", objectFit: "cover" }}
                  />
                ) : (
                  <div
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "50%",
                      background: "#e0f2fe",
                      color: "#0369a1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: "0.75rem",
                    }}
                  >
                    Dr
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: 700, color: "var(--slate-900)" }}>
                    {deleteConfirmDoctor.name}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--slate-500)" }}>
                    {deleteConfirmDoctor.email}
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "0.8125rem", color: "var(--slate-600)" }}>
                <div><strong>Specialization:</strong> {deleteConfirmDoctor.specialization || "General Medicine"}</div>
                {deleteConfirmDoctor.phone && <div><strong>Phone:</strong> {deleteConfirmDoctor.phone}</div>}
                <div><strong>Status:</strong> <span style={{ textTransform: "capitalize" }}>{deleteConfirmDoctor.status || "Approved"}</span></div>
                {deleteConfirmDoctor.createdAt && (
                  <div><strong>Registered:</strong> {new Date(deleteConfirmDoctor.createdAt).toLocaleDateString()}</div>
                )}
              </div>
            </div>

            <p style={{ fontSize: "0.8125rem", color: "var(--rose-700)", marginBottom: "20px" }}>
              The doctor account and their credentials will be deleted from the database. The doctor will no longer be able to log in.
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                className="btn btn-secondary"
                onClick={() => setDeleteConfirmDoctor(null)}
                disabled={Boolean(actionLoading)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                style={{
                  background: "var(--rose-600)",
                  borderColor: "var(--rose-600)",
                  color: "#ffffff",
                  gap: "6px",
                }}
                onClick={handleConfirmDeleteDoctor}
                disabled={Boolean(actionLoading)}
              >
                <Trash2 size={16} />
                {actionLoading === deleteConfirmDoctor._id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboard;
