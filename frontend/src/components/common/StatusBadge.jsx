import React from "react";
import { getStatusBadgeClass, getRoleBadgeClass } from "../../utils/formatters";

export const StatusBadge = ({ status, role }) => {
  if (role) {
    return (
      <span className={`badge ${getRoleBadgeClass(role)}`}>
        ● {role}
      </span>
    );
  }

  return (
    <span className={`badge ${getStatusBadgeClass(status)}`}>
      ● {status || "Pending"}
    </span>
  );
};

export default StatusBadge;
