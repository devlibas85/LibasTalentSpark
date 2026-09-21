import "./config/env.js";
import "./config/microsoft.strategy.js";
import passport from "passport";
import { app } from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./database/index.js";
import { User } from "./database/models/user.Models.js";

/* ================= PROCESS GUARDS ================= */

// Uncaught exception: log and exit — the process is in an undefined state
process.on("uncaughtException", (err) => {
  console.error("🔥 UNCAUGHT EXCEPTION — shutting down:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("🔥 UNHANDLED REJECTION — shutting down:", reason);
  process.exit(1);
});

/* ================= PASSPORT SESSION ================= */

// Only serialize the user's DB _id into the session — not the full object
passport.serializeUser((user: any, done) => {
  done(null, user._id ?? user.id ?? user);
});

// Deserialize: look up the user from DB by the stored _id
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id).lean();
    done(null, user ?? false);
  } catch (err) {
    done(err, false);
  }
});

/* ================= BOOT ================= */

(async () => {
  try {
    await connectDB();

    const server = app.listen(env.port, () => {
      console.log(`🚀 Server running on http://localhost:${env.port} [${env.nodeEnv}]`);
    });

    /* ================= GRACEFUL SHUTDOWN ================= */

    const shutdown = (signal: string) => {
      console.log(`\n${signal} received — closing HTTP server gracefully`);
      server.close(() => {
        console.log("✅ HTTP server closed");
        process.exit(0);
      });

      // Force exit after 10 s if connections don't drain
      setTimeout(() => {
        console.error("⚠️  Forced shutdown after timeout");
        process.exit(1);
      }, 10_000).unref();
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (err) {
    console.error("🔥 Server failed to start:", err);
    process.exit(1);
  }
})();
