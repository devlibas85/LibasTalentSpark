// src/pages/AuthSuccess.tsx
import { jwtDecode } from "jwt-decode";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

type DecodedToken = {
  email: string;
  name: string;
  role: "HR" | "EMPLOYEE";
  iat?: number;
  exp?: number;
};

export default function AuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get("token");

    console.log("🔐 Token from URL:", tokenFromUrl);

    if (tokenFromUrl) {
      const decoded = jwtDecode<DecodedToken>(tokenFromUrl);
      console.log("🧠 Decoded JWT payload:", decoded);

      // ✅ Changed to "token" to match jobApi
      localStorage.setItem("token", tokenFromUrl);
      localStorage.setItem("user_role", decoded.role);
      localStorage.setItem("user_email", decoded.email);
      localStorage.setItem("user_name", decoded.name);

      console.log("💾 Stored token:", localStorage.getItem("token"));
      console.log("💾 Stored user_role:", localStorage.getItem("user_role"));

      navigate("/dashboard", { replace: true });
      return;
    }

    const existingToken = localStorage.getItem("token");
    console.log("♻️ Existing token from storage:", existingToken);

    if (existingToken) {
      const decoded = jwtDecode<DecodedToken>(existingToken);
      console.log("🧠 Decoded stored token:", decoded);
      navigate("/dashboard", { replace: true });
      return;
    }

    console.warn("❌ No token found, redirecting to login");
    navigate("/login", { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex items-center gap-3 text-muted-foreground">
        <Loader2 className="animate-spin" />
        Signing you in…
      </div>
    </div>
  );
}