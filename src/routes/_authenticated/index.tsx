import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, Card, Badge } from "@/components/AppShell";
import { useHmsData } from "@/lib/hms-store";
import { Users, CalendarDays, Stethoscope, Receipt, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Dashboard — MediCare HMS" },
      { name: "description", content: "Hospital patient management dashboard with patients, appointments, doctors, and billing overview." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { patients, doctors, appointments, invoices } = useHmsData();
  const today = new Date().toISOString().slice(0, 10);
  const todaysAppts = appointments.filter((a) => a.date === today);
  const revenue = invoices.filter((i) => i.paid).reduce((s, i) => s + i.total, 0);
  const outstanding = invoices.filter((i) => !i.paid).reduce((s, i) => s + i.total, 0);

  const stats = [
    { label: "Patients", value: patients.length, icon: Users, to: "/patients" as const },
    { label: "Doctors", value: doctors.length, icon: Stethoscope, to: "/doctors" as const },
    { label: "Today's Appointments", value: todaysAppts.length, icon: CalendarDays, to: "/appointments" as const },
    { label: "Revenue Collected", value: `$${revenue.toLocaleString()}`, icon: Receipt, to: "/billing" as const },
  ];

  return (
    <AppShell title="Dashboard" subtitle="Overview of hospital operations">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} to={s.to}>
              <Card className="p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">{s.label}</div>
                    <div className="mt-2 text-2xl font-semibold">{s.value}</div>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary grid place-items-center">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Today's Appointments</h2>
            <Link to="/appointments" className="text-sm text-primary hover:underline">View all</Link>
          </div>
          {todaysAppts.length === 0 ? (
            <div className="text-sm text-muted-foreground py-8 text-center">No appointments today.</div>
          ) : (
            <div className="divide-y">
              {todaysAppts.map((a) => {
                const p = patients.find((x) => x.id === a.patientId);
                const d = doctors.find((x) => x.id === a.doctorId);
                return (
                  <div key={a.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{p ? `${p.firstName} ${p.lastName}` : "Unknown"}</div>
                      <div className="text-xs text-muted-foreground">{d?.name ?? "—"} · {a.reason}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{a.time}</div>
                      <Badge tone={a.status === "Completed" ? "success" : a.status === "Cancelled" ? "danger" : "info"}>{a.status}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold mb-4">Billing Snapshot</h2>
          <div className="space-y-4">
            <Row label="Collected" value={`$${revenue.toLocaleString()}`} tone="success" />
            <Row label="Outstanding" value={`$${outstanding.toLocaleString()}`} tone="warning" />
            <Row label="Invoices" value={invoices.length.toString()} tone="info" />
          </div>
          <div className="mt-6 p-3 rounded-lg bg-muted flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp className="h-4 w-4" /> Live data from your secure cloud database.
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone: "success" | "warning" | "info" }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <Badge tone={tone}>{value}</Badge>
    </div>
  );
}
