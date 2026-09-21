# 🏥 Medicare Portal – Enterprise Healthcare Management System

[![Full-Stack Architecture](https://img.shields.io/badge/Architecture-Decoupled_MERN-0d9488?style=for-the-badge)](https://github.com)
[![Frontend](https://img.shields.io/badge/Frontend-React_18_+_Vite-61dafb?style=for-the-badge&logo=react)](https://react.dev)
[![Backend](https://img.shields.io/badge/Backend-Node.js_+_Express-339933?style=for-the-badge&logo=node.js)](https://expressjs.com)
[![Database](https://img.shields.io/badge/Database-MongoDB_Atlas-47a248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/atlas)
[![Security](https://img.shields.io/badge/Security-JWT_+_RBAC_+_bcrypt-f59e0b?style=for-the-badge&logo=jsonwebtokens)](https://jwt.io)

An industry-standard, production-grade full-stack healthcare management system engineered to digitize clinical operations, electronic health records (EHR), and hospital workflows. The platform provides cryptographic role-based access control (RBAC) across **Patients**, **Doctors**, **Pharmacists**, and **Administrators**.

---

## 📌 Architectural Overview

Medicare Portal implements a decoupled client-server architecture:
- **Frontend SPA**: Built with React 18, Vite, React Router DOM, and Axios. Features a medical design system, live appointment scheduler, EHR viewer, and role-specific dashboards.
- **Backend REST API**: High-throughput Express.js engine enforcing JWT bearer authentication, role-based route protection, Mongoose schema validation, and structured error handling.
- **Database Layer**: MongoDB Atlas cloud cluster with relational schema modeling, indexing, and cascade virtuals.

```
Frontend (React 18 + Vite)
       │
       │ HTTP / JSON (Axios + JWT Interceptors)
       ▼
Backend REST API (Node.js + Express)
       │
       │ Role-Based Access Control (RBAC Middleware)
       ▼
Controllers & Business Logic (Auth, Patients, Doctors, Appointments, Billing)
       │
       │ Mongoose ODM & Validation
       ▼
Cloud Database (MongoDB Atlas Cluster)
```

---

## 📂 Repository Structure

```text
medicare-portal/
├── frontend/                     # Modern React Single Page Application (SPA)
│   ├── public/                   # Static assets, branding, and favicon
│   ├── src/
│   │   ├── assets/               # Medical illustrations and graphic assets
│   │   ├── components/
│   │   │   ├── common/           # Navbar, Sidebar, StatCard, StatusBadge, Modal
│   │   │   ├── layout/           # MainLayout (with sidebar) and AuthLayout
│   │   │   ├── forms/            # AppointmentForm, PatientForm, InvoiceForm
│   │   │   └── tables/           # AppointmentTable, PatientTable, InvoiceTable
│   │   │
│   │   ├── pages/
│   │   │   ├── Landing/          # High-converting hero, features & authentication access
│   │   │   ├── Login/            # Production JWT login with role redirection
│   │   │   ├── Register/         # Account registration with role selection
│   │   │   ├── Patient/          # Patient dashboard: Vitals telemetry & EHR history
│   │   │   ├── Doctor/           # Doctor dashboard: Consultation queue & digital Rx
│   │   │   ├── Pharmacist/       # Pharmacist dashboard: Prescription fulfillment queue
│   │   │   ├── Admin/            # Admin dashboard: Occupancy, audit logs & revenue
│   │   │   ├── Appointments/     # Comprehensive appointment scheduler & calendar
│   │   │   ├── MedicalRecords/   # Electronic Health Records (EHR) viewer
│   │   │   └── Billing/          # Itemized medical invoices & settlement actions
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global session state, JWT storage & auth methods
│   │   ├── services/
│   │   │   ├── api.js            # Axios client with JWT request/response interceptors
│   │   │   ├── authService.js    # Sign in, registration, and profile endpoints
│   │   │   ├── patientService.js # Clinical records and prescription management
│   │   │   ├── doctorService.js  # Medical directory & availability schedules
│   │   │   ├── appointmentService.js # Appointment scheduling & status updates
│   │   │   └── invoiceService.js # Hospital billing, line items & payment status
│   │   │
│   │   ├── routes/
│   │   │   └── ProtectedRoute.jsx # Route guard verifying JWT and user role clearances
│   │   ├── hooks/
│   │   │   └── useAuth.js        # Ergonomic authentication hook
│   │   ├── utils/
│   │   │   └── formatters.js     # Currency, timestamp, and status badge helpers
│   │   ├── styles/
│   │   │   └── index.css         # Modern medical CSS design system
│   │   ├── App.jsx               # Application routes and router configuration
│   │   └── main.jsx              # React DOM root mounting
│   │
│   ├── package.json
│   ├── vite.config.js            # Vite bundler configuration & local API proxy
│   └── .env.example
│
├── backend/                      # Scalable Express.js REST API
│   ├── config/
│   │   └── db.js                 # MongoDB Atlas Mongoose connection & event hooks
│   │
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, profile management
│   │   ├── patientController.js  # Patient CRUD, EHR records, prescriptions
│   │   ├── doctorController.js   # Specialist directories, schedules, shifts
│   │   ├── appointmentController.js # Appointment bookings, consultation queue
│   │   └── invoiceController.js  # Itemized billing, tax calculation, payment toggle
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT Bearer token extraction & verification
│   │   ├── roleMiddleware.js     # Role-Based Access Control (RBAC) guard
│   │   └── errorMiddleware.js    # 404 handler and custom Mongoose error parser
│   │
│   ├── models/
│   │   ├── User.js               # Account schema with bcrypt password hashing
│   │   ├── Patient.js            # Patient demographic, vitals, allergy & Rx schema
│   │   ├── Doctor.js             # Clinical specialist profile & shift schedules
│   │   ├── Appointment.js        # Appointment date, time, reason, status schema
│   │   └── Invoice.js            # Itemized charges, subtotal, total, payment status
│   │
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth
│   │   ├── patientRoutes.js      # /api/patients
│   │   ├── doctorRoutes.js       # /api/doctors
│   │   ├── appointmentRoutes.js  # /api/appointments
│   │   └── invoiceRoutes.js      # /api/invoices
│   │
│   ├── utils/
│   │   ├── generateToken.js      # JWT signing helper with expiration
│   │   └── clearDatabase.js      # Database maintenance & cleanup utility
│   │
│   ├── server.js                 # Express application entry point & CORS
│   ├── package.json
│   └── .env.example
│
├── README.md                     # Comprehensive technical documentation
├── DEPLOYMENT.md                 # Production deployment guide (Vercel + Render + Atlas)
├── package.json                  # Root monorepo runner scripts
└── .gitignore
```

---

## 🔐 Core Roles & Permissions

| Role | Key Capabilities & Access Rights | Accessible Endpoints |
| :--- | :--- | :--- |
| **Doctor** | Consultation queue management, patient vitals review, clinical notes logging, and digital prescription issuance. | `/dashboard/doctor`, `/appointments`, `/records`, `/billing` |
| **Patient** | Personal medical history, real-time vitals log (BP, HR, SpO2), appointment scheduling, and invoice settlement. | `/dashboard/patient`, `/appointments`, `/records`, `/billing` |
| **Pharmacist** | Real-time prescription fulfillment queue, dosage verification, allergy contraindication warnings, and dispensing logs. | `/dashboard/pharmacist`, `/records` |
| **Admin** | Department occupancy analytics, hospital capacity tracking, user administration, financial revenue collection, and billing issuance. | `/dashboard/admin`, `/appointments`, `/records`, `/billing` |

---

## 🔑 Production Role-Based Access Control

Users register an authentic account specifying their clinical or administrative role:

| Role | Access Permissions | Primary Workflow |
| :--- | :--- | :--- |
| **Doctor** | Consultation queue, patient EHR telemetry, clinical notes, digital Rx issuance | Complete patient sessions & prescribe medications |
| **Patient** | Personal health records, vital signs telemetry, appointment booking, invoices | View health history & schedule appointments |
| **Pharmacist**| Prescription queue, dosage verification, contraindication warnings, dispensing logs | Review & dispense active digital prescriptions |
| **Admin** | Hospital capacity monitoring, staff directory, audit compliance, billing invoices | System governance & financial clearances |

---

## 🌐 REST API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` – Register new user with designated role
- `POST /api/auth/login` – Authenticate user and return signed JWT token
- `GET /api/auth/me` – Retrieve profile of current authenticated user `[Protected]`
- `PUT /api/auth/profile` – Update user profile fields `[Protected]`

### Patients & EHR (`/api/patients`)
- `GET /api/patients` – Fetch all patient records `[Doctor, Pharmacist, Admin]`
- `GET /api/patients/me` – Fetch patient profile for logged-in patient `[Patient]`
- `GET /api/patients/:id` – Fetch single patient with full medical chart `[Protected]`
- `POST /api/patients` – Create new patient EHR record `[Doctor, Admin]`
- `PUT /api/patients/:id` – Update patient vitals and health history `[Doctor, Admin]`
- `DELETE /api/patients/:id` – Remove patient record `[Admin]`
- `POST /api/patients/:id/prescriptions` – Issue digital prescription `[Doctor]`
- `PATCH /api/patients/:id/prescriptions/:prescId` – Dispense medication `[Pharmacist, Doctor, Admin]`

### Doctors & Specialists (`/api/doctors`)
- `GET /api/doctors` – Query medical staff directory with specialty filters `[Public / Protected]`
- `GET /api/doctors/me` – Fetch logged-in doctor profile `[Doctor]`
- `GET /api/doctors/:id` – Fetch individual doctor details `[Public / Protected]`
- `POST /api/doctors` – Register new doctor profile `[Admin]`
- `PUT /api/doctors/:id` – Update doctor shifts and availability `[Doctor, Admin]`
- `DELETE /api/doctors/:id` – Remove doctor profile `[Admin]`

### Appointments (`/api/appointments`)
- `GET /api/appointments` – List appointments (automatically role-scoped) `[Protected]`
- `GET /api/appointments/:id` – Get appointment details `[Protected]`
- `POST /api/appointments` – Book appointment `[Patient, Doctor, Admin]`
- `PUT /api/appointments/:id/status` – Update consultation status & notes `[Doctor, Admin]`
- `DELETE /api/appointments/:id` – Cancel appointment `[Protected]`

### Invoices & Billing (`/api/invoices`)
- `GET /api/invoices` – List invoices (scoped by patient or all for staff) `[Protected]`
- `GET /api/invoices/:id` – Get itemized invoice breakdown `[Protected]`
- `POST /api/invoices` – Generate new invoice with line items `[Admin, Doctor]`
- `PUT /api/invoices/:id/status` – Settle invoice / toggle payment status `[Protected]`
- `DELETE /api/invoices/:id` – Delete invoice `[Admin]`

---

## 🚀 Quick Start & Local Development

### 1. Prerequisites
- **Node.js** (v18.0 or higher)
- **MongoDB** (Local instance or free MongoDB Atlas URI)
- **npm** or **pnpm**

### 2. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/medicare-portal.git
cd medicare-portal

# Install all backend and frontend dependencies in one step:
npm run install:all
```

### 3. Configure Environment Variables

**Backend (`backend/.env`):**
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/medicare?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters
PORT=5000
NODE_ENV=development
```

**Frontend (`frontend/.env`):**
```env
VITE_API_URL=/api
```

### 4. Create Your Account
Open the portal and click **Register** to create your real user account as a Patient, Doctor, Pharmacist, or Administrator.

### 5. Run the Application
Open two terminal windows (or run concurrently):

```bash
# Terminal 1 - Start Backend API (Port 5000)
npm run server

# Terminal 2 - Start Frontend Vite Dev Server (Port 5173)
npm run client
```

Navigate to your local frontend port or the deployed production environment to explore the portal.

---

## 🚢 Cloud Deployment (Render + Vercel)

For step-by-step instructions on deploying the backend on **Render** and the frontend on **Vercel**, refer to the full [DEPLOYMENT.md](./DEPLOYMENT.md) guide.

---

## 🛡️ Security Best Practices

- **Password Hashing**: Passwords are encrypted using `bcryptjs` with 10 salt rounds before persistence.
- **Stateless Tokens**: Authentication uses digitally signed JSON Web Tokens (JWT) with standard expiration and claim validation.
- **RBAC Enforcement**: API middleware inspects token claims on every restricted request to prevent privilege escalation.
- **Input Sanitization**: Mongoose schemas validate all incoming payload types, enums, and required fields.
- **CORS Protection**: Explicit Cross-Origin Resource Sharing controls restrict unauthorized third-party origin access.

---

## 📄 License
This project is open-source software licensed under the [MIT License](LICENSE).
