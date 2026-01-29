
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

  if (tokenFromUrl) {
    const decoded = jwtDecode<DecodedToken>(tokenFromUrl);

    localStorage.setItem("auth_token", tokenFromUrl);
    localStorage.setItem("user_role", decoded.role);
    localStorage.setItem("user_email", decoded.email);
    localStorage.setItem("user_name", decoded.name);

    navigate("/dashboard", { replace: true });
    return;
  }

  const existingToken = localStorage.getItem("auth_token");

  if (existingToken) {
    navigate("/dashboard", { replace: true });
    return;
  }

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