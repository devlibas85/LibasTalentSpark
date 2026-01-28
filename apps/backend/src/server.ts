import "./config/env.js";
import "./modules/auth/microsoft.strategy.js";
import passport from "passport";
import { app } from "./app.js";
import { env } from "./config/env.js";

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});

app.listen(env.port, () => {
  console.log(`🚀 Server is Running on http://localhost:${env.port}`);
});
