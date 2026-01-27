import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

/**
 * ENTRY POINT — SAME ROUTE
 * Frontend always hits this
 */
router.get("/microsoft", (req, res) => {
  return res.redirect("/auth/microsoft/mock");
});

/**
 * MOCK AUTH — BACKEND IS SOURCE OF TRUTH
 */
router.get("/microsoft/mock", (req, res) => {
  const mockUser =
    process.env.MOCK_ROLE === "HR"
      ? {
          email: "hr.user@libas.in",
          name: "HR User",
          role: "HR",
        }
      : {
          email: "employee.user@libas.in",
          name: "Employee User",
          role: "EMPLOYEE",
        };

  const token = jwt.sign(
    mockUser,
    process.env.JWT_SECRET || "dev-secret",
    { expiresIn: "8h" }
  );

  res.redirect(
    `${process.env.FRONTEND_URL}/auth/success?token=${token}`
  );
});

export default router;
