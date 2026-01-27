import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

const router = express.Router();

// router.get(
//   "/microsoft",
//   passport.authenticate("azuread-openidconnect")
// );

// router.get(
//   "/microsoft/callback",
//   passport.authenticate("azuread-openidconnect", {
//     session: false,
//    failureRedirect: `${process.env.FRONTEND_URL}/login`

//   }),
//   (req, res) => {
//     const user = req.user as any;

//     const token = jwt.sign(
//       { email: user.email },
//       process.env.JWT_SECRET!,
//       { expiresIn: "8h" }
//     );

//     res.redirect(
//       `${process.env.FRONTEND_URL}/auth/success?token=${token}`
//     );
//   }
// );

router.get("/microsoft", (req, res) => {
  console.log("✅ Frontend hit /auth/microsoft");

  // simulate redirect to callback
  res.redirect("/auth/microsoft/callback");
});

router.get("/microsoft/callback", (req, res) => {
  console.log("✅ Mock Microsoft callback reached");

  const fakeUser = {
    email: "test.user@libas.in",
    name: "Test User",
  };

  const token = jwt.sign(
    fakeUser,
    process.env.JWT_SECRET || "dev-secret",
    { expiresIn: "1h" }
  );

  res.redirect(
    `${process.env.FRONTEND_URL}/auth/success?token=${token}`
  );
});

export default router;
