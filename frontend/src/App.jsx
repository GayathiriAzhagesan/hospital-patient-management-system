import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import MainLayout from "./components/layout/MainLayout";

// Public Pages
import LandingPage from "./pages/Landing/LandingPage";
import LoginPage from "./pages/Login/LoginPage";
import RegisterPage from "./pages/Register/RegisterPage";

// Clinical Role Dashboards
import PatientDashboard from "./pages/Patient/PatientDashboard";
import DoctorDashboard from "./pages/Doctor/DoctorDashboard";
import PharmacistDashboard from "./pages/Pharmacist/PharmacistDashboard";
import AdminDashboard from "./pages/Admin/AdminDashboard";

// Clinical Modules
import AppointmentsPage from "./pages/Appointments/AppointmentsPage";
import MedicalRecordsPage from "./pages/MedicalRecords/MedicalRecordsPage";
import BillingPage from "./pages/Billing/BillingPage";

// Dashboard Redirect Helper
const DashboardRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/dashboard/${user.role.toLowerCase()}`} replace />;
};

export const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Clinical Applications (MainLayout) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              {/* Default redirect to role dashboard */}
              <Route path="/dashboard" element={<DashboardRedirect />} />

              {/* Role-Specific Dashboards */}
              <Route path="/dashboard/patient" element={<PatientDashboard />} />
              <Route path="/dashboard/doctor" element={<DoctorDashboard />} />
              <Route path="/dashboard/pharmacist" element={<PharmacistDashboard />} />
              <Route path="/dashboard/admin" element={<AdminDashboard />} />

              {/* General Healthcare Modules */}
              <Route path="/appointments" element={<AppointmentsPage />} />
              <Route path="/records" element={<MedicalRecordsPage />} />
              <Route path="/billing" element={<BillingPage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
