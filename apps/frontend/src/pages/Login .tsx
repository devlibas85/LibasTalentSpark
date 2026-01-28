import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  

  const handleMicrosoftLogin = () => {
    setIsLoading(true);
    window.location.href = "http://localhost:4000/auth/microsoft";
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-2 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          {/* Top accent */}
          <div className="h-1 bg-primary" />

          <div className="p-6">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-6"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-3 overflow-hidden">
                <img
                  src="/logo.jpg"
                  alt="Libas TalentSpark"
                  className="w-full h-full object-cover"
                />
              </div>
              <h1 className="text-2xl font-semibold text-foreground mb-1">
                Libas TalentSpark
              </h1>
              <p className="text-muted-foreground text-sm">
                Sign in using your Libas Microsoft account
              </p>
            </motion.div>

            {/* Microsoft Login */}
            <button
              onClick={handleMicrosoftLogin}
              disabled={isLoading}
              className="
                w-full flex items-center justify-center gap-3
                py-2.5 rounded-lg font-medium
                bg-[#0078D4] hover:bg-[#106ebe]
                text-white transition-colors
                disabled:opacity-70 disabled:cursor-not-allowed
              "
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Redirecting…
                </>
              ) : (
                <>
                  {/* Microsoft logo */}
                  <svg width="18" height="18" viewBox="0 0 23 23">
                    <rect x="1" y="1" width="10" height="10" fill="#F25022" />
                    <rect x="12" y="1" width="10" height="10" fill="#7FBA00" />
                    <rect x="1" y="12" width="10" height="10" fill="#00A4EF" />
                    <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
                  </svg>
                  Sign in with Microsoft
                </>
              )}
            </button>

            {/* Helper text */}
            <p className="text-xs text-muted-foreground text-center mt-4">
              Only <span className="font-medium">name.surname@libas.in</span> accounts
              are allowed
            </p>
          </div>

          {/* Bottom accent */}
          <div className="h-1 bg-primary" />
        </div>
      </motion.div>

      {/* Background blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/3 rounded-full blur-3xl opacity-40" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/3 rounded-full blur-3xl opacity-30" />
      </div>
    </div>
  );
}
