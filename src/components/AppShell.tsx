import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  LayoutDashboard, Users, CalendarDays, Stethoscope, Receipt, Activity,
} from "lucide-react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/patients", label: "Patients", icon: Users },
  { to: "/appointments", label: "Appointments", icon: CalendarDays },
  { to: "/doctors", label: "Doctors", icon: Stethoscope },
  { to: "/billing", label: "Billing", icon: Receipt },
] as const;

export function AppShell({ title, subtitle, actions, children }: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden md:flex w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <div className="px-6 py-5 flex items-center gap-2 border-b border-sidebar-border">
          <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground grid place-items-center">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold tracking-tight">MediCare HMS</div>
            <div className="text-xs opacity-70">Patient Management</div>
          </div>
        </div>
        <nav className="p-3 space-y-1 flex-1">
          {nav.map((n) => {
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.exact }}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-sidebar-accent transition-colors"
                activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground font-medium" }}
              >
                <Icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 text-xs opacity-60 border-t border-sidebar-border">
          © {new Date().getFullYear()} MediCare
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="border-b bg-card sticky top-0 z-10">
          <div className="px-6 py-4 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold">{title}</h1>
              {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-2">{actions}</div>
          </div>
          <div className="md:hidden px-3 pb-3 flex gap-1 overflow-x-auto">
            {nav.map((n) => {
              const Icon = n.icon;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  activeOptions={{ exact: n.exact }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border whitespace-nowrap"
                  activeProps={{ className: "bg-primary text-primary-foreground border-primary" }}
                >
                  <Icon className="h-3.5 w-3.5" /> {n.label}
                </Link>
              );
            })}
          </div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`bg-card border rounded-xl shadow-sm ${className}`}>{children}</div>;
}

export function Button({
  children, variant = "primary", size = "md", className = "", ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "destructive" | "outline";
  size?: "sm" | "md";
}) {
  const variants: Record<string, string> = {
    primary: "bg-primary text-primary-foreground hover:opacity-90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-muted",
    destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
    outline: "border bg-card hover:bg-muted",
  };
  const sizes: Record<string, string> = {
    sm: "h-8 px-3 text-xs",
    md: "h-9 px-4 text-sm",
  };
  return (
    <button
      className={`inline-flex items-center gap-1.5 rounded-md font-medium transition-colors disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-9 w-full rounded-md border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring/50 ${props.className ?? ""}`}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`h-9 w-full rounded-md border bg-card px-2 text-sm outline-none focus:ring-2 focus:ring-ring/50 ${props.className ?? ""}`}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`min-h-20 w-full rounded-md border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50 ${props.className ?? ""}`}
    />
  );
}

export function Label({ children }: { children: ReactNode }) {
  return <label className="text-xs font-medium text-muted-foreground">{children}</label>;
}

export function Badge({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "success" | "warning" | "danger" | "info" }) {
  const tones: Record<string, string> = {
    default: "bg-muted text-muted-foreground",
    success: "bg-success/15 text-success",
    warning: "bg-warning/20 text-warning-foreground",
    danger: "bg-destructive/15 text-destructive",
    info: "bg-primary/15 text-primary",
  };
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

export function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg bg-card rounded-xl shadow-lg border" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h3 className="font-semibold">{title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
