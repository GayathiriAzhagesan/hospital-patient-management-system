import React, { useState, useEffect } from "react";
import appointmentService from "../../services/appointmentService";
import { useAuth } from "../../context/AuthContext";
import AppointmentTable from "../../components/tables/AppointmentTable";
import Modal from "../../components/common/Modal";
import AppointmentForm from "../../components/forms/AppointmentForm";
import { Calendar, Plus, Filter } from "lucide-react";

export const AppointmentsPage = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await appointmentService.getAll();
      if (res.success && res.appointments) {
        setAppointments(res.appointments);
      }
    } catch (err) {
      console.error("Failed to load appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await appointmentService.updateStatus(id, { status });
      fetchAppointments();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await appointmentService.cancel(id);
      fetchAppointments();
    } catch (err) {
      alert("Failed to cancel appointment");
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (filter === "scheduled") return apt.status === "Scheduled";
    if (filter === "completed") return apt.status === "Completed";
    if (filter === "cancelled") return apt.status === "Cancelled";
    return true;
  });

  const canManage = user?.role === "Doctor" || user?.role === "Admin";

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
            Clinical Appointments
          </h1>
          <p style={{ color: "var(--slate-500)", marginTop: "4px" }}>
            Schedule and manage medical consultations with specialists
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary"
        >
          <Plus size={18} /> Schedule Consultation
        </button>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "20px",
          borderBottom: "1px solid var(--border-color)",
          paddingBottom: "12px",
        }}
      >
        <button
          onClick={() => setFilter("all")}
          className={`btn btn-sm ${filter === "all" ? "btn-primary" : "btn-secondary"}`}
        >
          All ({appointments.length})
        </button>
        <button
          onClick={() => setFilter("scheduled")}
          className={`btn btn-sm ${filter === "scheduled" ? "btn-primary" : "btn-secondary"}`}
        >
          Scheduled ({appointments.filter((a) => a.status === "Scheduled").length})
        </button>
        <button
          onClick={() => setFilter("completed")}
          className={`btn btn-sm ${filter === "completed" ? "btn-primary" : "btn-secondary"}`}
        >
          Completed ({appointments.filter((a) => a.status === "Completed").length})
        </button>
        <button
          onClick={() => setFilter("cancelled")}
          className={`btn btn-sm ${filter === "cancelled" ? "btn-primary" : "btn-secondary"}`}
        >
          Cancelled ({appointments.filter((a) => a.status === "Cancelled").length})
        </button>
      </div>

      {loading ? (
        <div style={{ padding: "60px 0", textAlign: "center", color: "var(--slate-400)" }}>
          Loading appointment schedules...
        </div>
      ) : (
        <AppointmentTable
          appointments={filteredAppointments}
          onUpdateStatus={handleUpdateStatus}
          onCancel={handleCancel}
          canManage={canManage}
        />
      )}

      {/* Booking Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Physician Consultation"
      >
        <AppointmentForm
          onSuccess={() => {
            setIsModalOpen(false);
            fetchAppointments();
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default AppointmentsPage;
