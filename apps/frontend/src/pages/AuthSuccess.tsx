import { jwtDecode } from "jwt-decode";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setAuth } from "../store/slice/authSlice";
import { toast } from "sonner";


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
    const toastId = toast.loading("Signing you in..."); 
    const authenticate = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const tokenFromUrl = params.get("token");
        const token = tokenFromUrl || localStorage.getItem("auth_token");

        if (!token) {
           toast.error("Authentication token missing", { id: toastId });
          navigate("/login", { replace: true });
          return;
        }

        const decoded = jwtDecode<DecodedToken>(token);

        // 🔐 Token expiry check
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem("auth_token");
           toast.error("Session expired. Please login again.", {
            id: toastId,
          });
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
           toast.success(`Welcome back, ${decoded.name}!`, {
          id: toastId,
        });

        navigate("/dashboard", { replace: true });
      } catch (error) {
        console.debug("Authentication failed:", error);
        localStorage.removeItem("auth_token");
         toast.error("Authentication failed. Please login again.", {
          id: toastId,
        });
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
