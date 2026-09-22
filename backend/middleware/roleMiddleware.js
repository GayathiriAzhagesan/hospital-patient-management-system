export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: No user role identified on request.",
      });
    }

    const userRole = (req.user.role || "").toLowerCase();
    const normalizedAllowed = allowedRoles.map((r) => (r || "").toLowerCase());

    if (!normalizedAllowed.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user.role}' is not authorized to access this resource. Allowed roles: ${allowedRoles.join(", ")}`,
      });
    }

    next();
  };
};

export default authorizeRoles;
