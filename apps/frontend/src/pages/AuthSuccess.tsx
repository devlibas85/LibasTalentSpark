import { jwtDecode } from "jwt-decode";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setAuth } from "../store/slice/authSlice";

type DecodedToken = {
  email: string;
  name: string;
  role: "HR" | "EMPLOYEE";
  iat?: number;
  exp?: number;
};

const roleMap = {
  HR: "hr",
  EMPLOYEE: "employee",
} as const;

export default function AuthSuccess() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const authenticate = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const tokenFromUrl = params.get("token");
        const token = tokenFromUrl || localStorage.getItem("auth_token");

        if (!token) {
          navigate("/login", { replace: true });
          return;
        }

        const decoded = jwtDecode<DecodedToken>(token);

        // 🔐 Token expiry check
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem("auth_token");
          navigate("/login", { replace: true });
          return;
        }

        // Persist token
        localStorage.setItem("auth_token", token);

        // Hydrate Redux
        dispatch(
          setAuth({
            token,
            name: decoded.name,
            email: decoded.email,
            role: roleMap[decoded.role],
          })
        );

        navigate("/dashboard", { replace: true });
      } catch (error) {
        console.error("Authentication failed:", error);
        localStorage.removeItem("auth_token");
        navigate("/login", { replace: true });
      }
    };

    authenticate();
  }, [dispatch, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex items-center gap-3 text-muted-foreground">
        <Loader2 className="animate-spin" />
        Signing you in…
      </div>
    </div>
  );
}
