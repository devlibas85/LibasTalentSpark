import "./config/env.js";
import "./modules/auth/microsoft.strategy.js";
import passport from "passport";
import { app } from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./database/index.js";


process.on("uncaughtException", (err) => {
  console.error("🔥 UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("🔥 UNHANDLED REJECTION:", reason);
});

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});

(async () => {
  try {
    await connectDB(); 
    app.listen(env.port, () => {
      console.log(`🚀 Server running on http://localhost:${env.port}`);
    });
  } catch (err) {
    console.error("🔥 Server failed to start:", err);
    process.exit(1);
  }
})();