import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, Card, Button, Input, Select, Label, Modal, Badge } from "@/components/AppShell";
import { db, uid, useHmsData, type Appointment } from "@/lib/hms-store";
import { Plus, Pencil, Trash2 } from "lucide-react";

export const Route = createFileRoute("/appointments")({
  head: () => ({
    meta: [
      { title: "Appointments — MediCare HMS" },
      { name: "description", content: "Schedule and manage patient appointments with doctors." },
    ],
  }),
  component: AppointmentsPage,
});

const empty = (): Appointment => ({
  id: uid(), patientId: "", doctorId: "", date: new Date().toISOString().slice(0, 10),
  time: "09:00", reason: "", status: "Scheduled",
});

function AppointmentsPage() {
  const { appointments, patients, doctors } = useHmsData();
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [filter, setFilter] = useState<"all" | "today" | "upcoming">("all");

  const today = new Date().toISOString().slice(0, 10);
  const shown = appointments
    .filter((a) => filter === "all" ? true : filter === "today" ? a.date === today : a.date >= today)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  return (
    <AppShell
      title="Appointments"
      subtitle={`${appointments.length} total`}
      actions={<Button onClick={() => setEditing(empty())}><Plus className="h-4 w-4" /> New Appointment</Button>}
    >
      <div className="flex gap-2 mb-4">
        {(["all","today","upcoming"] as const).map((k) => (
          <button key={k} onClick={() => setFilter(k)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border capitalize ${filter === k ? "bg-primary text-primary-foreground border-primary" : "bg-card"}`}>
            {k}
          </button>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Doctor</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {shown.map((a) => {
                const p = patients.find((x) => x.id === a.patientId);
                const d = doctors.find((x) => x.id === a.doctorId);
                return (
                  <tr key={a.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">{a.date}</td>
                    <td className="px-4 py-3 font-medium">{a.time}</td>
                    <td className="px-4 py-3">{p ? `${p.firstName} ${p.lastName}` : "—"}</td>
                    <td className="px-4 py-3">{d?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{a.reason}</td>
                    <td className="px-4 py-3">
                      <Badge tone={a.status === "Completed" ? "success" : a.status === "Cancelled" ? "danger" : "info"}>{a.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setEditing(a)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => { if (confirm("Delete appointment?")) db.deleteAppointment(a.id); }}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {shown.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No appointments.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={appointments.find((a) => a.id === editing?.id) ? "Edit Appointment" : "New Appointment"}>
        {editing && (
          <ApptForm
            appt={editing}
            onSave={(a) => { db.upsertAppointment(a); setEditing(null); }}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>
    </AppShell>
  );
}

function ApptForm({ appt, onSave, onCancel }: { appt: Appointment; onSave: (a: Appointment) => void; onCancel: () => void }) {
  const { patients, doctors } = useHmsData();
  const [f, setF] = useState(appt);
  const set = <K extends keyof Appointment>(k: K, v: Appointment[K]) => setF({ ...f, [k]: v });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(f); }} className="space-y-3">
      <div><Label>Patient</Label>
        <Select required value={f.patientId} onChange={(e) => set("patientId", e.target.value)}>
          <option value="">Select patient…</option>
          {patients.map((p) => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
        </Select>
      </div>
      <div><Label>Doctor</Label>
        <Select required value={f.doctorId} onChange={(e) => set("doctorId", e.target.value)}>
          <option value="">Select doctor…</option>
          {doctors.map((d) => <option key={d.id} value={d.id}>{d.name} — {d.specialty}</option>)}
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Date</Label><Input required type="date" value={f.date} onChange={(e) => set("date", e.target.value)} /></div>
        <div><Label>Time</Label><Input required type="time" value={f.time} onChange={(e) => set("time", e.target.value)} /></div>
      </div>
      <div><Label>Reason</Label><Input value={f.reason} onChange={(e) => set("reason", e.target.value)} /></div>
      <div><Label>Status</Label>
        <Select value={f.status} onChange={(e) => set("status", e.target.value as Appointment["status"])}>
          <option>Scheduled</option><option>Completed</option><option>Cancelled</option>
        </Select>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}
