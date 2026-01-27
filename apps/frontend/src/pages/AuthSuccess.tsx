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

    // ✅ If token exists in URL → first login
    if (tokenFromUrl) {
      const decoded = jwtDecode<DecodedToken>(tokenFromUrl);

      localStorage.setItem("auth_token", tokenFromUrl);
      localStorage.setItem("user_role", decoded.role);

      navigate("/dashboard", { replace: true });
      return;
    }

    // ✅ If already logged in (StrictMode second mount)
    const existingToken = localStorage.getItem("auth_token");
    if (existingToken) {
      navigate("/dashboard", { replace: true });
      return;
    }

    // ❌ Only redirect if truly unauthenticated
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
