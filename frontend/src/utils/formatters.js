export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
};

export const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
};

export const getStatusBadgeClass = (status) => {
  switch ((status || "").toLowerCase()) {
    case "scheduled":
      return "badge-scheduled";
    case "completed":
    case "paid":
    case "dispensed":
      return "badge-completed";
    case "cancelled":
    case "overdue":
      return "badge-cancelled";
    case "pending":
    case "in-progress":
    case "active":
      return "badge-pending";
    default:
      return "badge-pending";
  }
};

export const getRoleBadgeClass = (role) => {
  switch ((role || "").toLowerCase()) {
    case "doctor":
      return "badge-role-doctor";
    case "patient":
      return "badge-role-patient";
    case "pharmacist":
      return "badge-role-pharmacist";
    case "admin":
      return "badge-role-admin";
    default:
      return "badge-role-patient";
  }
};

export const getInitials = (name) => {
  if (!name) return "MP";
  return name
    .replace(/^Dr\.\s*/i, "")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};
