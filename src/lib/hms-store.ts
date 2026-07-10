// Simple localStorage-backed store for the hospital management system.
// Client-only; safe against SSR by guarding window access.

export type Patient = {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: "male" | "female" | "other";
  phone: string;
  email: string;
  address: string;
  bloodGroup: string;
  allergies: string;
  history: string;
  createdAt: string;
};

export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  department: string;
  phone: string;
  email: string;
  shift: "Morning" | "Evening" | "Night";
};

export type Appointment = {
  id: string;
  patientId: string;
  doctorId: string;
  date: string; // ISO date
  time: string; // HH:mm
  reason: string;
  status: "Scheduled" | "Completed" | "Cancelled";
};

export type InvoiceItem = { description: string; amount: number };
export type Invoice = {
  id: string;
  patientId: string;
  items: InvoiceItem[];
  total: number;
  paid: boolean;
  createdAt: string;
};

type DB = {
  patients: Patient[];
  doctors: Doctor[];
  appointments: Appointment[];
  invoices: Invoice[];
};

const KEY = "hms:db:v1";

const seed = (): DB => ({
  patients: [
    {
      id: "p1", firstName: "Aarav", lastName: "Sharma", dob: "1988-04-12",
      gender: "male", phone: "555-0101", email: "aarav@example.com",
      address: "22 Oak St", bloodGroup: "O+", allergies: "Penicillin",
      history: "Hypertension", createdAt: new Date().toISOString(),
    },
    {
      id: "p2", firstName: "Maya", lastName: "Iyer", dob: "1995-09-30",
      gender: "female", phone: "555-0102", email: "maya@example.com",
      address: "88 Pine Ave", bloodGroup: "A-", allergies: "None",
      history: "Asthma", createdAt: new Date().toISOString(),
    },
  ],
  doctors: [
    { id: "d1", name: "Dr. Nadia Chen", specialty: "Cardiology", department: "Cardiology", phone: "555-0201", email: "nchen@hms.io", shift: "Morning" },
    { id: "d2", name: "Dr. Marco Silva", specialty: "Pediatrics", department: "Pediatrics", phone: "555-0202", email: "msilva@hms.io", shift: "Evening" },
    { id: "d3", name: "Dr. Priya Rao", specialty: "General Medicine", department: "OPD", phone: "555-0203", email: "prao@hms.io", shift: "Morning" },
  ],
  appointments: [
    { id: "a1", patientId: "p1", doctorId: "d1", date: new Date().toISOString().slice(0,10), time: "10:00", reason: "Follow-up", status: "Scheduled" },
    { id: "a2", patientId: "p2", doctorId: "d3", date: new Date().toISOString().slice(0,10), time: "14:30", reason: "Consultation", status: "Scheduled" },
  ],
  invoices: [
    { id: "i1", patientId: "p1", items: [{ description: "Consultation", amount: 80 }, { description: "ECG", amount: 120 }], total: 200, paid: true, createdAt: new Date().toISOString() },
  ],
});

function read(): DB {
  if (typeof window === "undefined") return seed();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      const s = seed();
      window.localStorage.setItem(KEY, JSON.stringify(s));
      return s;
    }
    return JSON.parse(raw) as DB;
  } catch {
    return seed();
  }
}

function write(db: DB) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(db));
  window.dispatchEvent(new Event("hms:changed"));
}

export const uid = () => Math.random().toString(36).slice(2, 10);

export const db = {
  all: () => read(),
  save: (db: DB) => write(db),
  // patients
  listPatients: () => read().patients,
  getPatient: (id: string) => read().patients.find((p) => p.id === id),
  upsertPatient: (p: Patient) => {
    const d = read();
    const idx = d.patients.findIndex((x) => x.id === p.id);
    if (idx >= 0) d.patients[idx] = p; else d.patients.push(p);
    write(d);
  },
  deletePatient: (id: string) => {
    const d = read();
    d.patients = d.patients.filter((p) => p.id !== id);
    d.appointments = d.appointments.filter((a) => a.patientId !== id);
    d.invoices = d.invoices.filter((i) => i.patientId !== id);
    write(d);
  },
  // doctors
  listDoctors: () => read().doctors,
  upsertDoctor: (doc: Doctor) => {
    const d = read();
    const idx = d.doctors.findIndex((x) => x.id === doc.id);
    if (idx >= 0) d.doctors[idx] = doc; else d.doctors.push(doc);
    write(d);
  },
  deleteDoctor: (id: string) => {
    const d = read();
    d.doctors = d.doctors.filter((x) => x.id !== id);
    write(d);
  },
  // appointments
  listAppointments: () => read().appointments,
  upsertAppointment: (a: Appointment) => {
    const d = read();
    const idx = d.appointments.findIndex((x) => x.id === a.id);
    if (idx >= 0) d.appointments[idx] = a; else d.appointments.push(a);
    write(d);
  },
  deleteAppointment: (id: string) => {
    const d = read();
    d.appointments = d.appointments.filter((x) => x.id !== id);
    write(d);
  },
  // invoices
  listInvoices: () => read().invoices,
  upsertInvoice: (i: Invoice) => {
    const d = read();
    const idx = d.invoices.findIndex((x) => x.id === i.id);
    if (idx >= 0) d.invoices[idx] = i; else d.invoices.push(i);
    write(d);
  },
  deleteInvoice: (id: string) => {
    const d = read();
    d.invoices = d.invoices.filter((x) => x.id !== id);
    write(d);
  },
};

// React hook to subscribe to changes
import { useEffect, useState } from "react";
export function useHmsData() {
  const [data, setData] = useState<DB>(() => (typeof window === "undefined" ? seed() : read()));
  useEffect(() => {
    const on = () => setData(read());
    on();
    window.addEventListener("hms:changed", on);
    window.addEventListener("storage", on);
    return () => {
      window.removeEventListener("hms:changed", on);
      window.removeEventListener("storage", on);
    };
  }, []);
  return data;
}
