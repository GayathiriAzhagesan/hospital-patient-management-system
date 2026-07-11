// Supabase-backed data layer for the hospital management system.
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  date: string;
  time: string;
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

// Row mappers
const patientFromRow = (r: any): Patient => ({
  id: r.id,
  firstName: r.first_name ?? "",
  lastName: r.last_name ?? "",
  dob: r.dob ?? "",
  gender: (r.gender ?? "other") as Patient["gender"],
  phone: r.phone ?? "",
  email: r.email ?? "",
  address: r.address ?? "",
  bloodGroup: r.blood_group ?? "",
  allergies: r.allergies ?? "",
  history: r.history ?? "",
  createdAt: r.created_at ?? "",
});
const patientToRow = (p: Patient) => ({
  first_name: p.firstName, last_name: p.lastName, dob: p.dob || null,
  gender: p.gender, phone: p.phone || null, email: p.email || null,
  address: p.address || null, blood_group: p.bloodGroup || null,
  allergies: p.allergies || null, history: p.history || null,
});

const doctorFromRow = (r: any): Doctor => ({
  id: r.id, name: r.name ?? "", specialty: r.specialty ?? "",
  department: r.department ?? "", phone: r.phone ?? "", email: r.email ?? "",
  shift: (r.shift ?? "Morning") as Doctor["shift"],
});
const doctorToRow = (d: Doctor) => ({
  name: d.name, specialty: d.specialty || null, department: d.department || null,
  phone: d.phone || null, email: d.email || null, shift: d.shift,
});

const apptFromRow = (r: any): Appointment => ({
  id: r.id, patientId: r.patient_id, doctorId: r.doctor_id,
  date: r.date, time: r.time, reason: r.reason ?? "",
  status: (r.status ?? "Scheduled") as Appointment["status"],
});
const apptToRow = (a: Appointment) => ({
  patient_id: a.patientId, doctor_id: a.doctorId,
  date: a.date, time: a.time, reason: a.reason || null, status: a.status,
});

const invoiceFromRow = (r: any): Invoice => ({
  id: r.id, patientId: r.patient_id,
  items: Array.isArray(r.items) ? r.items : [],
  total: Number(r.total) || 0, paid: !!r.paid,
  createdAt: r.created_at ?? "",
});
const invoiceToRow = (i: Invoice) => ({
  patient_id: i.patientId, items: i.items, total: i.total, paid: i.paid,
});

const HMS_KEY = ["hms-data"] as const;

async function fetchAll() {
  const [p, d, a, i] = await Promise.all([
    supabase.from("patients").select("*").order("created_at", { ascending: false }),
    supabase.from("doctors").select("*").order("name"),
    supabase.from("appointments").select("*").order("date").order("time"),
    supabase.from("invoices").select("*").order("created_at", { ascending: false }),
  ]);
  if (p.error) throw p.error;
  if (d.error) throw d.error;
  if (a.error) throw a.error;
  if (i.error) throw i.error;
  return {
    patients: (p.data ?? []).map(patientFromRow),
    doctors: (d.data ?? []).map(doctorFromRow),
    appointments: (a.data ?? []).map(apptFromRow),
    invoices: (i.data ?? []).map(invoiceFromRow),
  };
}

export function useHmsData() {
  const { data } = useQuery({
    queryKey: HMS_KEY,
    queryFn: fetchAll,
    staleTime: 15_000,
  });
  return data ?? { patients: [], doctors: [], appointments: [], invoices: [] };
}

export function useHmsActions() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: HMS_KEY });

  const savePatient = useMutation({
    mutationFn: async (p: Patient) => {
      const row = patientToRow(p);
      const isNew = !p.id || p.id.length < 20; // uuid check
      if (isNew) {
        const { error } = await supabase.from("patients").insert(row);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("patients").update(row).eq("id", p.id);
        if (error) throw error;
      }
    },
    onSuccess: invalidate,
  });
  const deletePatient = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("patients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const saveDoctor = useMutation({
    mutationFn: async (d: Doctor) => {
      const row = doctorToRow(d);
      const isNew = !d.id || d.id.length < 20;
      if (isNew) {
        const { error } = await supabase.from("doctors").insert(row);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("doctors").update(row).eq("id", d.id);
        if (error) throw error;
      }
    },
    onSuccess: invalidate,
  });
  const deleteDoctor = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("doctors").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const saveAppointment = useMutation({
    mutationFn: async (a: Appointment) => {
      const row = apptToRow(a);
      const isNew = !a.id || a.id.length < 20;
      if (isNew) {
        const { error } = await supabase.from("appointments").insert(row);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("appointments").update(row).eq("id", a.id);
        if (error) throw error;
      }
    },
    onSuccess: invalidate,
  });
  const deleteAppointment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("appointments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const saveInvoice = useMutation({
    mutationFn: async (i: Invoice) => {
      const row = invoiceToRow(i);
      const isNew = !i.id || i.id.length < 20;
      if (isNew) {
        const { error } = await supabase.from("invoices").insert(row);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("invoices").update(row).eq("id", i.id);
        if (error) throw error;
      }
    },
    onSuccess: invalidate,
  });
  const deleteInvoice = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("invoices").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return {
    savePatient, deletePatient,
    saveDoctor, deleteDoctor,
    saveAppointment, deleteAppointment,
    saveInvoice, deleteInvoice,
  };
}

// Local id for new (unsaved) records — replaced by real uuid on insert.
export const uid = () => "new-" + Math.random().toString(36).slice(2, 10);
