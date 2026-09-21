# 🚀 Cloud Deployment Guide: Medicare Portal

This guide provides step-by-step instructions to deploy the decoupled full-stack **Medicare Portal** to production with live public URLs using:
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas) (Free M0 Shared Cluster)
- **Backend API**: [Render.com](https://render.com) (Free Node.js Web Service)
- **Frontend SPA**: [Vercel](https://vercel.com) (Free Global Edge Hosting)

---

## 📌 Production Architecture Overview

| Component | Technology | Hosting Provider | Deployment Root | Public Access |
| :--- | :--- | :--- | :--- | :--- |
| **Database** | MongoDB Atlas | MongoDB Cloud | N/A | Cloud ReplicaSet |
| **Backend** | Node.js / Express | Render | `backend/` | `https://medicare-backend-lqem.onrender.com` |
| **Frontend** | React 18 / Vite | Vercel | `frontend/` | `https://medicare-portal.vercel.app` |

---

## Part 1: Set Up MongoDB Atlas (Cloud Database)

1. **Create Account & Cluster**:
   - Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) and sign in.
   - Click **Create Deployment** -> Select **M0 Free** (512MB storage, free forever).
   - Select a cloud provider (AWS) and a region closest to your audience (e.g. `us-east-1` or `ap-south-1`).
   - Click **Create**.

2. **Configure Database Credentials**:
   - In **Security** -> **Database Access**, create a user (e.g., `medicare_admin`).
   - Choose a secure password (e.g., `MedicareSecure2026!`).
   - Role: `Read and write to any database`.

3. **Whitelist Network Access**:
   - Go to **Security** -> **Network Access**.
   - Click **Add IP Address**.
   - Choose **Allow Access from Anywhere** (`0.0.0.0/0`).
   - Click **Confirm**. *(Required so cloud instances on Render can communicate with MongoDB Atlas).*

4. **Copy Connection URI**:
   - In **Database** -> Click **Connect** on your cluster.
   - Select **Drivers** (Node.js, version 5.5 or later).
   - Copy the connection string:
     ```text
     mongodb+srv://medicare_admin:<password>@cluster0.xxxxx.mongodb.net/medicare?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your actual password.

---

## Part 2: Deploy Backend REST API to Render.com

1. **Sign in to Render**:
   - Go to [render.com](https://render.com) and log in with your GitHub account.

2. **Create New Web Service**:
   - Click **New +** -> **Web Service**.
   - Select your repository: `hospital-patient-management-system` (or `medicare-portal`).

3. **Configure Service Settings**:
   - **Name**: `medicare-backend`
   - **Region**: Oregon (US West) or Frankfurt (EU)
   - **Root Directory**: `backend` *(Crucial: tell Render to use the backend folder)*
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: `Free`

4. **Add Environment Variables**:
   Under **Environment Variables**, add:
   | Key | Value |
   | :--- | :--- |
   | `MONGO_URI` | `mongodb+srv://<user>:<password>@live-poll-cluster.rebwgqc.mongodb.net/medicare?retryWrites=true&w=majority` |
   | `JWT_SECRET` | `medicare_super_secret_jwt_key_2026_production_secure` |
   | `PORT` | `5000` |
   | `NODE_ENV` | `production` |

5. **Deploy**:
   - Click **Create Web Service**.
   - Render will build and launch your backend.
   - Live production backend URL:
     `https://medicare-backend-lqem.onrender.com`
   - Verify health check in your browser:
     `https://medicare-backend-lqem.onrender.com/api/health`

---

## Part 3: Deploy Frontend SPA to Vercel

1. **Sign in to Vercel**:
   - Go to [vercel.com](https://vercel.com) and connect your GitHub account.

2. **Import Project**:
   - Click **Add New...** -> **Project**.
   - Select your `medicare-portal` repository.

3. **Configure Project Settings**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click **Edit** and select `frontend`.
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Add Environment Variable**:
   In the **Environment Variables** section:
   | Key | Value |
   | :--- | :--- |
   | `VITE_API_URL` | `https://medicare-backend-lqem.onrender.com/api` |

5. **Deploy**:
   - Click **Deploy**.
   - In less than a minute, Vercel will build and assign a global production URL:
     `https://medicare-portal.vercel.app`

---

## Part 4: Post-Deployment Verification Checklist

1. **Health Check**: Open `https://medicare-backend-lqem.onrender.com/api/health`. Should return `{"status": "ok", "database": "MongoDB Atlas (Connected)"}`.
2. **Landing Page**: Open your Vercel URL. Ensure illustrations, medical cards, and fonts load with zero console errors.
3. **Register New Account**: Register a new Doctor, Patient, Pharmacist, or Admin account and confirm seamless redirection.
4. **Schedule Appointment**: Book a consultation from the Patient portal and verify it immediately displays in the Doctor consultation station.
5. **Pharmacy Dispensation**: Open `/dashboard/pharmacist` and verify the prescription fulfillment and dispensing logs update dynamically in MongoDB Atlas.
6. **Billing & Invoices**: Generate and settle invoices in Indian Rupees (`₹`) with live calculations.
