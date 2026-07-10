import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, Card, Button, Input, Select, Label, Modal, Badge } from "@/components/AppShell";
import { db, uid, useHmsData, type Invoice, type InvoiceItem } from "@/lib/hms-store";
import { Plus, Pencil, Trash2, Check } from "lucide-react";

export const Route = createFileRoute("/billing")({
  head: () => ({
    meta: [
      { title: "Billing — MediCare HMS" },
      { name: "description", content: "Create invoices, track payments, and manage patient billing." },
    ],
  }),
  component: BillingPage,
});

const empty = (): Invoice => ({
  id: uid(), patientId: "", items: [{ description: "", amount: 0 }],
  total: 0, paid: false, createdAt: new Date().toISOString(),
});

function BillingPage() {
  const { invoices, patients } = useHmsData();
  const [editing, setEditing] = useState<Invoice | null>(null);
  const collected = invoices.filter((i) => i.paid).reduce((s, i) => s + i.total, 0);
  const outstanding = invoices.filter((i) => !i.paid).reduce((s, i) => s + i.total, 0);

  return (
    <AppShell
      title="Billing"
      subtitle={`${invoices.length} invoices`}
      actions={<Button onClick={() => setEditing(empty())}><Plus className="h-4 w-4" /> New Invoice</Button>}
    >
      <div className="grid gap-4 sm:grid-cols-3 mb-4">
        <Card className="p-4"><div className="text-xs text-muted-foreground">Collected</div><div className="text-2xl font-semibold text-success">${collected.toLocaleString()}</div></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground">Outstanding</div><div className="text-2xl font-semibold" style={{ color: "var(--warning-foreground)" }}>${outstanding.toLocaleString()}</div></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground">Invoices</div><div className="text-2xl font-semibold">{invoices.length}</div></Card>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {invoices.map((i) => {
                const p = patients.find((x) => x.id === i.patientId);
                return (
                  <tr key={i.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs">#{i.id.slice(0,6).toUpperCase()}</td>
                    <td className="px-4 py-3">{p ? `${p.firstName} ${p.lastName}` : "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{i.items.length} item(s)</td>
                    <td className="px-4 py-3 font-medium">${i.total.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <Badge tone={i.paid ? "success" : "warning"}>{i.paid ? "Paid" : "Unpaid"}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1">
                        {!i.paid && (
                          <Button variant="ghost" size="sm" onClick={() => db.upsertInvoice({ ...i, paid: true })}>
                            <Check className="h-3.5 w-3.5 text-success" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => setEditing(i)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => { if (confirm("Delete invoice?")) db.deleteInvoice(i.id); }}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {invoices.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No invoices yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={invoices.find((i) => i.id === editing?.id) ? "Edit Invoice" : "New Invoice"}>
        {editing && <InvoiceForm inv={editing} onSave={(v) => { db.upsertInvoice(v); setEditing(null); }} onCancel={() => setEditing(null)} />}
      </Modal>
    </AppShell>
  );
}

function InvoiceForm({ inv, onSave, onCancel }: { inv: Invoice; onSave: (v: Invoice) => void; onCancel: () => void }) {
  const { patients } = useHmsData();
  const [f, setF] = useState(inv);
  const setItems = (items: InvoiceItem[]) => setF({ ...f, items, total: items.reduce((s, i) => s + (Number(i.amount) || 0), 0) });
  const updateItem = (i: number, patch: Partial<InvoiceItem>) => setItems(f.items.map((it, idx) => idx === i ? { ...it, ...patch } : it));
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(f); }} className="space-y-3">
      <div><Label>Patient</Label>
        <Select required value={f.patientId} onChange={(e) => setF({ ...f, patientId: e.target.value })}>
          <option value="">Select patient…</option>
          {patients.map((p) => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
        </Select>
      </div>
      <div>
        <Label>Line items</Label>
        <div className="space-y-2 mt-1">
          {f.items.map((it, i) => (
            <div key={i} className="grid grid-cols-[1fr_120px_auto] gap-2">
              <Input placeholder="Description" value={it.description} onChange={(e) => updateItem(i, { description: e.target.value })} />
              <Input type="number" min={0} step="0.01" placeholder="Amount" value={it.amount} onChange={(e) => updateItem(i, { amount: Number(e.target.value) })} />
              <Button type="button" variant="ghost" size="sm" onClick={() => setItems(f.items.filter((_, idx) => idx !== i))}>
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => setItems([...f.items, { description: "", amount: 0 }])}>
            <Plus className="h-3.5 w-3.5" /> Add item
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={f.paid} onChange={(e) => setF({ ...f, paid: e.target.checked })} />
          Marked as paid
        </label>
        <div className="text-lg font-semibold">Total: ${f.total.toLocaleString()}</div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save Invoice</Button>
      </div>
    </form>
  );
}
