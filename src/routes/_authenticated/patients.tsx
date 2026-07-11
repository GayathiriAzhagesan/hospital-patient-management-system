import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell, Card, Button, Input, Select, Label, Textarea, Modal, Badge } from "@/components/AppShell";
import { uid, useHmsData, useHmsActions, type Patient } from "@/lib/hms-store";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/patients")({
  head: () => ({
    meta: [
      { title: "Patients — MediCare HMS" },
      { name: "description", content: "Manage patient records, demographics, and medical history." },
    ],
  }),
  component: PatientsPage,
});

const empty = (): Patient => ({
  id: uid(), firstName: "", lastName: "", dob: "", gender: "male",
  phone: "", email: "", address: "", bloodGroup: "", allergies: "",
  history: "", createdAt: new Date().toISOString(),
});

function PatientsPage() {
  const { patients } = useHmsData();
  const { savePatient, deletePatient } = useHmsActions();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Patient | null>(null);

  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return patients.filter((p) =>
      `${p.firstName} ${p.lastName} ${p.phone} ${p.email} ${p.bloodGroup}`.toLowerCase().includes(s),
    );
  }, [patients, q]);

  return (
    <AppShell
      title="Patients"
      subtitle={`${patients.length} registered`}
      actions={<Button onClick={() => setEditing(empty())}><Plus className="h-4 w-4" /> New Patient</Button>}
    >
      <Card className="p-4 mb-4">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name, phone, email, blood group…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Gender</th>
                <th className="px-4 py-3">DOB</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Blood</th>
                <th className="px-4 py-3">Allergies</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{p.firstName} {p.lastName}</td>
                  <td className="px-4 py-3 capitalize">{p.gender}</td>
                  <td className="px-4 py-3">{p.dob}</td>
                  <td className="px-4 py-3">{p.phone}</td>
                  <td className="px-4 py-3"><Badge tone="info">{p.bloodGroup || "—"}</Badge></td>
                  <td className="px-4 py-3 text-muted-foreground">{p.allergies || "None"}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setEditing(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => { if (confirm(`Delete ${p.firstName}?`)) deletePatient.mutate(p.id); }}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No patients found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing && !editing.id.startsWith("new-") ? "Edit Patient" : "New Patient"}>
        {editing && (
          <PatientForm
            patient={editing}
            busy={savePatient.isPending}
            onSave={(p) => savePatient.mutate(p, { onSuccess: () => setEditing(null) })}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>
    </AppShell>
  );
}

function PatientForm({ patient, onSave, onCancel, busy }: { patient: Patient; onSave: (p: Patient) => void; onCancel: () => void; busy: boolean }) {
  const [f, setF] = useState(patient);
  const set = <K extends keyof Patient>(k: K, v: Patient[K]) => setF({ ...f, [k]: v });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(f); }} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div><Label>First name</Label><Input required value={f.firstName} onChange={(e) => set("firstName", e.target.value)} /></div>
        <div><Label>Last name</Label><Input required value={f.lastName} onChange={(e) => set("lastName", e.target.value)} /></div>
        <div><Label>Date of birth</Label><Input type="date" value={f.dob} onChange={(e) => set("dob", e.target.value)} /></div>
        <div><Label>Gender</Label>
          <Select value={f.gender} onChange={(e) => set("gender", e.target.value as Patient["gender"])}>
            <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
          </Select>
        </div>
        <div><Label>Phone</Label><Input value={f.phone} onChange={(e) => set("phone", e.target.value)} /></div>
        <div><Label>Email</Label><Input type="email" value={f.email} onChange={(e) => set("email", e.target.value)} /></div>
        <div><Label>Blood group</Label>
          <Select value={f.bloodGroup} onChange={(e) => set("bloodGroup", e.target.value)}>
            <option value="">—</option>
            {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((b) => <option key={b}>{b}</option>)}
          </Select>
        </div>
        <div><Label>Allergies</Label><Input value={f.allergies} onChange={(e) => set("allergies", e.target.value)} /></div>
      </div>
      <div><Label>Address</Label><Input value={f.address} onChange={(e) => set("address", e.target.value)} /></div>
      <div><Label>Medical history</Label><Textarea value={f.history} onChange={(e) => set("history", e.target.value)} /></div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save Patient"}</Button>
      </div>
    </form>
  );
}
