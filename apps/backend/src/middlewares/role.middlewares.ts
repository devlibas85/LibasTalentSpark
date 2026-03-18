// middlewares/role.middleware.ts
import { type Request, type Response, type NextFunction } from "express";

export const requireRole = (allowedRoles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Forbidden: You don't have permission to access this resource",
      });
    }

    next();
  };
};

// Role constants matching your UserSchemaType
export const ROLES = {
  HR: "HR",
  EMPLOYEE: "EMPLOYEE",
} as const;

// Pre-configured middleware for common role combinations
export const requireHR = requireRole(ROLES.HR);
export const requireEmployee = requireRole(ROLES.EMPLOYEE);
export const requireHRorEmployee = requireRole([ROLES.HR, ROLES.EMPLOYEE]);
