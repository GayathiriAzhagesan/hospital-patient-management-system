import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, Card, Button, Input, Select, Label, Modal, Badge } from "@/components/AppShell";
import { db, uid, useHmsData, type Doctor } from "@/lib/hms-store";
import { Plus, Pencil, Trash2, Stethoscope } from "lucide-react";

export const Route = createFileRoute("/doctors")({
  head: () => ({
    meta: [
      { title: "Doctors — MediCare HMS" },
      { name: "description", content: "Manage doctors, specialties, departments and shifts." },
    ],
  }),
  component: DoctorsPage,
});

const empty = (): Doctor => ({
  id: uid(), name: "", specialty: "", department: "", phone: "", email: "", shift: "Morning",
});

function DoctorsPage() {
  const { doctors } = useHmsData();
  const [editing, setEditing] = useState<Doctor | null>(null);

  return (
    <AppShell
      title="Doctors & Staff"
      subtitle={`${doctors.length} on record`}
      actions={<Button onClick={() => setEditing(empty())}><Plus className="h-4 w-4" /> New Doctor</Button>}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {doctors.map((d) => (
          <Card key={d.id} className="p-5">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-full bg-accent/20 text-accent-foreground grid place-items-center">
                <Stethoscope className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="font-semibold">{d.name}</div>
                <div className="text-sm text-muted-foreground">{d.specialty}</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge tone="info">{d.department}</Badge>
                  <Badge tone={d.shift === "Morning" ? "success" : d.shift === "Evening" ? "warning" : "default"}>{d.shift}</Badge>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-1 text-sm text-muted-foreground">
              <div>{d.phone}</div>
              <div>{d.email}</div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditing(d)}><Pencil className="h-3.5 w-3.5" /> Edit</Button>
              <Button variant="ghost" size="sm" onClick={() => { if (confirm(`Remove ${d.name}?`)) db.deleteDoctor(d.id); }}>
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </div>
          </Card>
        ))}
        {doctors.length === 0 && <div className="text-muted-foreground">No doctors yet.</div>}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={doctors.find((d) => d.id === editing?.id) ? "Edit Doctor" : "New Doctor"}>
        {editing && <DocForm doc={editing} onSave={(d) => { db.upsertDoctor(d); setEditing(null); }} onCancel={() => setEditing(null)} />}
      </Modal>
    </AppShell>
  );
}

function DocForm({ doc, onSave, onCancel }: { doc: Doctor; onSave: (d: Doctor) => void; onCancel: () => void }) {
  const [f, setF] = useState(doc);
  const set = <K extends keyof Doctor>(k: K, v: Doctor[K]) => setF({ ...f, [k]: v });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(f); }} className="space-y-3">
      <div><Label>Full name</Label><Input required value={f.name} onChange={(e) => set("name", e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Specialty</Label><Input required value={f.specialty} onChange={(e) => set("specialty", e.target.value)} /></div>
        <div><Label>Department</Label><Input required value={f.department} onChange={(e) => set("department", e.target.value)} /></div>
        <div><Label>Phone</Label><Input value={f.phone} onChange={(e) => set("phone", e.target.value)} /></div>
        <div><Label>Email</Label><Input type="email" value={f.email} onChange={(e) => set("email", e.target.value)} /></div>
      </div>
      <div><Label>Shift</Label>
        <Select value={f.shift} onChange={(e) => set("shift", e.target.value as Doctor["shift"])}>
          <option>Morning</option><option>Evening</option><option>Night</option>
        </Select>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save Doctor</Button>
      </div>
    </form>
  );
}
