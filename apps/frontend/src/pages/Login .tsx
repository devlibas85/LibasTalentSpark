import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  ChevronLeft,
  User,
} from "lucide-react";
import type { ReactNode, ChangeEvent } from "react";
import type { LucideIcon } from "lucide-react";
import {
  useLoginMutation,
  useRegisterMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
} from "@/store/api/authApi";
import { useNavigate } from "react-router-dom";
import { setAuth } from "@/store/slice/authSlice";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

// ─── Types ─────────────────────────────────────────────────────────────────────
type InputProps = {
  icon?: LucideIcon;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  rightElement?: ReactNode;
};

type PrimaryButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
};

type DividerProps = { label: string };
type OtpInputProps = { value: string; onChange: (v: string) => void };
type LoginFormProps = { onSwitchToSignup: () => void };
type SignupFormProps = { onSwitchToLogin: () => void };

// ─── Background ────────────────────────────────────────────────────────────────
const Background = () => (
  <div className="fixed inset-0 -z-10 bg-background">
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: `
          linear-gradient(hsl(var(--primary) / 0.05) 1px, transparent 1px),
          linear-gradient(90deg, hsl(var(--primary) / 0.05) 1px, transparent 1px)
        `,
        backgroundSize: "48px 48px",
      }}
    />
    <div
      className="absolute rounded-full"
      style={{
        top: "-20%",
        right: "10%",
        width: 500,
        height: 500,
        background:
          "radial-gradient(circle, hsl(var(--primary) / 0.12) 0%, transparent 70%)",
      }}
    />
    <div
      className="absolute rounded-full"
      style={{
        bottom: "-20%",
        left: "5%",
        width: 400,
        height: 400,
        background:
          "radial-gradient(circle, hsl(var(--primary) / 0.07) 0%, transparent 70%)",
      }}
    />
  </div>
);

// ─── Microsoft Logo ─────────────────────────────────────────────────────────────
const MicrosoftLogo = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 23 23" fill="none">
    <rect x="1" y="1" width="10" height="10" fill="#F25022" />
    <rect x="12" y="1" width="10" height="10" fill="#7FBA00" />
    <rect x="1" y="12" width="10" height="10" fill="#00A4EF" />
    <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
  </svg>
);

// ─── Input ──────────────────────────────────────────────────────────────────────
const Input = ({
  icon: Icon,
  type = "text",
  placeholder,
  value,
  onChange,
  rightElement,
}: InputProps) => (
  <div className="relative flex items-center bg-muted/40 border border-border rounded-[10px] transition-colors focus-within:border-primary/60">
    {Icon && (
      <Icon
        size={16}
        className="absolute left-3.5 text-muted-foreground pointer-events-none"
      />
    )}
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full py-3 pl-10 pr-10 bg-transparent border-none outline-none text-foreground text-sm placeholder:text-muted-foreground/50"
    />
    {rightElement && <div className="absolute right-3">{rightElement}</div>}
  </div>
);

// ─── Primary Button ─────────────────────────────────────────────────────────────
const PrimaryButton = ({
  children,
  onClick,
  disabled,
  loading,
}: PrimaryButtonProps) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    className="
      w-full py-3 px-5 rounded-[10px] font-semibold text-sm
      flex items-center justify-center gap-2
      bg-primary text-primary-foreground
      hover:opacity-90 active:scale-[0.99]
      disabled:opacity-40 disabled:cursor-not-allowed
      transition-all duration-200
      shadow-[0_4px_20px_hsl(var(--primary)/0.3)]
    "
  >
    {loading ? <Loader2 size={16} className="animate-spin" /> : children}
  </button>
);

// ─── Ghost / Secondary Button ───────────────────────────────────────────────────
const GhostButton = ({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) => (
  <button
    onClick={disabled ? undefined : onClick}
    className={`
      w-full py-3 px-5 rounded-[10px] font-medium text-sm
      flex items-center justify-center gap-2.5
      border transition-all duration-200
      ${
        disabled
          ? "bg-muted/30 text-muted-foreground border-border cursor-not-allowed opacity-70"
          : "bg-muted/40 text-foreground border-border hover:bg-muted/70 hover:border-border/80"
      }
    `}
  >
    {children}
  </button>
);

// ─── Divider ────────────────────────────────────────────────────────────────────
const Divider = ({ label }: DividerProps) => (
  <div className="flex items-center gap-3 my-1">
    <div className="flex-1 h-px bg-border" />
    <span className="text-xs text-muted-foreground">{label}</span>
    <div className="flex-1 h-px bg-border" />
  </div>
);

// ─── OTP Input ──────────────────────────────────────────────────────────────────
const OtpInput = ({ value, onChange }: OtpInputProps) => {
  const digits = (value + "      ").split("").slice(0, 6);
  return (
    <div className="relative flex gap-2 justify-center">
      {digits.map((d, i) => (
        <div
          key={i}
          className="
            w-11 h-13 rounded-lg
            flex items-center justify-center
            text-xl font-bold text-foreground
            border transition-colors font-mono
          "
          style={{
            height: 52,
            borderColor: d.trim()
              ? "hsl(var(--primary) / 0.7)"
              : "hsl(var(--border))",
            background: d.trim()
              ? "hsl(var(--primary) / 0.08)"
              : "hsl(var(--muted) / 0.4)",
          }}
        >
          {d.trim()}
        </div>
      ))}
      <input
        type="text"
        inputMode="numeric"
        maxLength={6}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
        className="absolute opacity-0 w-full cursor-text"
        style={{ height: 52 }}
      />
    </div>
  );
};

// ─── Back Button ────────────────────────────────────────────────────────────────
const BackButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm transition-colors w-fit"
  >
    <ChevronLeft size={15} /> Back
  </button>
);

// ─── Password Strength Bar ──────────────────────────────────────────────────────
const StrengthBar = ({ password }: { password: string }) => {
  if (!password.length) return null;
  const strength =
    password.length < 6
      ? 1
      : password.length < 10
        ? 2
        : password.length < 14
          ? 3
          : 4;
  const colors = ["", "#ef4444", "#f59e0b", "hsl(var(--primary))", "#22c55e"];
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex-1 h-0.75 rounded-full transition-all duration-300"
          style={{
            background: i <= strength ? colors[strength] : "hsl(var(--border))",
          }}
        />
      ))}
    </div>
  );
};

// ─── LOGIN FORM ─────────────────────────────────────────────────────────────────
function LoginForm({ onSwitchToSignup }: LoginFormProps) {
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [step, setStep] = useState<"email" | "otp" | "password">("email");

  // Login fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  // Forgot password fields
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);

  const [login, { isLoading }] = useLoginMutation();
  const [sendOtp, { isLoading: isSendingOtp }] = useSendOtpMutation();
  const [resetPassword, { isLoading: isResetting }] =
    useResetPasswordMutation();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await login({ email, password }).unwrap();
      if (res.success) {
        dispatch(
          setAuth({
            name: res.user.name,
            email: res.user.email,
            role: res.user.role,
          }),
        );
        navigate("/dashboard");
      }
    } catch (error) {
      console.log(error);
      toast.error("Login failed");
    }
  };

  const handleSendForgotOtp = async () => {
    try {
      await sendOtp({
        email: forgotEmail,
        purpose: "forgot",
      }).unwrap();
      setStep("otp");
    } catch (error) {
      console.log(error);
      toast.error("Failed to send OTP");
    }
  };

  const handleVerifyOtp = () => {
    if (otp.length === 6) setStep("password");
  };

  const handleResetPassword = async () => {
    try {
      await resetPassword({
        email: forgotEmail,
        otp,
        password: newPassword,
      }).unwrap();
      toast.success("Password reset successful! Please sign in.");
      setMode("login");
      setStep("email");
      setForgotEmail("");
      setOtp("");
      setNewPassword("");
      setConfirmPw("");
    } catch (error) {
      console.log(error);
      toast.error("Password reset failed");
    }
  };

  const handleForgotPassword = () => {
    setMode("forgot");
    setStep("email");
  };

  const handleBackToLogin = () => {
    setMode("login");
    setStep("email");
    setForgotEmail("");
    setOtp("");
    setNewPassword("");
    setConfirmPw("");
  };

  const slide = {
    initial: { opacity: 0, x: 16 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -16 },
    transition: { duration: 0.18 },
  };

  // ── Forgot Password Flow ──
  if (mode === "forgot") {
    return (
      <div className="flex flex-col gap-4">
        <AnimatePresence mode="wait">
          {/* Step 1: Email */}
          {step === "email" && (
            <motion.div
              key="forgot-email"
              {...slide}
              className="flex flex-col gap-3.5"
            >
              <BackButton onClick={handleBackToLogin} />
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">
                  Reset your password
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Enter your email to receive a verification code
                </p>
              </div>
              <Input
                icon={Mail}
                type="email"
                placeholder="name.surname@libas.in"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
              />
              <PrimaryButton
                onClick={handleSendForgotOtp}
                loading={isSendingOtp}
                disabled={!forgotEmail}
              >
                Send verification code <ArrowRight size={15} />
              </PrimaryButton>
            </motion.div>
          )}

          {/* Step 2: OTP */}
          {step === "otp" && (
            <motion.div
              key="forgot-otp"
              {...slide}
              className="flex flex-col gap-4"
            >
              <BackButton onClick={() => setStep("email")} />
              <p className="text-center text-sm text-muted-foreground leading-relaxed">
                We sent a 6-digit code to
                <br />
                <span className="text-primary font-semibold">
                  {forgotEmail}
                </span>
              </p>
              <OtpInput value={otp} onChange={setOtp} />
              <PrimaryButton
                onClick={handleVerifyOtp}
                disabled={otp.length < 6}
              >
                Verify code
              </PrimaryButton>
              <p className="text-center text-xs text-muted-foreground">
                Didn't receive it?{" "}
                <button
                  onClick={handleSendForgotOtp}
                  disabled={isSendingOtp}
                  className="text-primary hover:underline disabled:opacity-50"
                >
                  {isSendingOtp ? "Sending…" : "Resend"}
                </button>
              </p>
            </motion.div>
          )}

          {/* Step 3: New Password */}
          {step === "password" && (
            <motion.div
              key="forgot-password"
              {...slide}
              className="flex flex-col gap-3.5"
            >
              <BackButton onClick={() => setStep("otp")} />
              <div className="text-center">
                <div
                  className="inline-flex items-center justify-center w-11 h-11 rounded-xl mb-2 border"
                  style={{
                    background: "hsl(var(--primary) / 0.12)",
                    borderColor: "hsl(var(--primary) / 0.3)",
                  }}
                >
                  <Lock size={18} className="text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Set your new password
                </p>
              </div>
              <Input
                icon={Lock}
                type={showNewPw ? "text" : "password"}
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                rightElement={
                  <button
                    onClick={() => setShowNewPw((p) => !p)}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1"
                  >
                    {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }
              />
              <StrengthBar password={newPassword} />
              <Input
                icon={Lock}
                type={showNewPw ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
              />
              <PrimaryButton
                onClick={handleResetPassword}
                loading={isResetting}
                disabled={
                  !newPassword ||
                  newPassword !== confirmPw ||
                  newPassword.length < 6
                }
              >
                Reset password <ArrowRight size={15} />
              </PrimaryButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ── Normal Login Flow ──
  return (
    <div className="flex flex-col gap-4">
      <GhostButton disabled>
        <MicrosoftLogo />
        Continue with Microsoft
        <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded-md">
          Coming Soon
        </span>
      </GhostButton>

      <Divider label="or sign in with email" />

      <Input
        icon={Mail}
        type="email"
        placeholder="name.surname@libas.in"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <Input
        icon={Lock}
        type={showPw ? "text" : "password"}
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        rightElement={
          <button
            onClick={() => setShowPw((p) => !p)}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        }
      />

      <div className="flex justify-end -mt-2">
        <button
          className="text-xs text-primary/80 hover:text-primary transition-colors"
          onClick={handleForgotPassword}
        >
          Forgot password?
        </button>
      </div>

      <PrimaryButton
        onClick={handleLogin}
        loading={isLoading}
        disabled={!email || !password}
      >
        Sign In <ArrowRight size={15} />
      </PrimaryButton>

      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <button
          onClick={onSwitchToSignup}
          className="text-primary font-semibold hover:underline"
        >
          Sign up
        </button>
      </p>
    </div>
  );
}

// ─── SIGNUP FORM ────────────────────────────────────────────────────────────────
function SignupForm({ onSwitchToLogin }: SignupFormProps) {
  const [step, setStep] = useState<"email" | "otp" | "password">("email");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);

  const [sendOtp, { isLoading: isSendingOtp }] = useSendOtpMutation();
  const [verifyOtp, { isLoading: isVerifyingOtp }] = useVerifyOtpMutation();
  const [register, { isLoading: isRegistering }] = useRegisterMutation();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSendSignupOtp = async () => {
    try {
      await sendOtp({
        email,
        purpose: "signup",
      }).unwrap();
      setStep("otp");
    } catch (error) {
      console.log(error);
      toast.error("Failed to send OTP");
    }
  };

  const handleVerifySignupOtp = async () => {
    try {
      await verifyOtp({ email, otp }).unwrap();
      setStep("password");
    } catch (error) {
      console.log(error);
      toast.error("Invalid OTP");
    }
  };

  const handleRegister = async () => {
    try {
      const res = await register({ email, password, name }).unwrap();
      if (res.success) {
        dispatch(
          setAuth({
            name: res.user.name,
            email: res.user.email,
            role: res.user.role,
          }),
        );
        navigate("/dashboard");
      }
    } catch (error) {
      console.log(error);
      toast.error("Registration failed");
    }
  };

  const slide = {
    initial: { opacity: 0, x: 16 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -16 },
    transition: { duration: 0.18 },
  };

  return (
    <div className="flex flex-col gap-4">
      {step === "email" && (
        <>
          <GhostButton disabled>
            <MicrosoftLogo />
            Continue with Microsoft
            <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded-md">
              Coming Soon
            </span>
          </GhostButton>
          <Divider label="or sign up with email" />
        </>
      )}

      <AnimatePresence mode="wait">
        {/* ── Step 1: Email ── */}
        {step === "email" && (
          <motion.div key="email" {...slide} className="flex flex-col gap-3.5">
            <Input
              icon={User}
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              icon={Mail}
              type="email"
              placeholder="name.surname@libas.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <PrimaryButton
              onClick={handleSendSignupOtp}
              loading={isSendingOtp}
              disabled={!email || !name}
            >
              Send verification code <ArrowRight size={15} />
            </PrimaryButton>
          </motion.div>
        )}

        {/* ── Step 2: OTP ── */}
        {step === "otp" && (
          <motion.div key="otp" {...slide} className="flex flex-col gap-4">
            <BackButton onClick={() => setStep("email")} />
            <p className="text-center text-sm text-muted-foreground leading-relaxed">
              We sent a 6-digit code to
              <br />
              <span className="text-primary font-semibold">{email}</span>
            </p>
            <OtpInput value={otp} onChange={setOtp} />
            <PrimaryButton
              onClick={handleVerifySignupOtp}
              loading={isVerifyingOtp}
              disabled={otp.length < 6}
            >
              Verify code
            </PrimaryButton>
            <p className="text-center text-xs text-muted-foreground">
              Didn't receive it?{" "}
              <button
                onClick={handleSendSignupOtp}
                disabled={isSendingOtp}
                className="text-primary hover:underline disabled:opacity-50"
              >
                {isSendingOtp ? "Sending…" : "Resend"}
              </button>
            </p>
          </motion.div>
        )}

        {/* ── Step 3: Password ── */}
        {step === "password" && (
          <motion.div
            key="password"
            {...slide}
            className="flex flex-col gap-3.5"
          >
            <BackButton onClick={() => setStep("otp")} />
            <div className="text-center">
              <div
                className="inline-flex items-center justify-center w-11 h-11 rounded-xl mb-2 border"
                style={{
                  background: "hsl(var(--primary) / 0.12)",
                  borderColor: "hsl(var(--primary) / 0.3)",
                }}
              >
                <Lock size={18} className="text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                Set a secure password for your account
              </p>
            </div>
            <Input
              icon={Lock}
              type={showPw ? "text" : "password"}
              placeholder="Create password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              rightElement={
                <button
                  onClick={() => setShowPw((p) => !p)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />
            <StrengthBar password={password} />
            <Input
              icon={Lock}
              type={showPw ? "text" : "password"}
              placeholder="Confirm password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
            />
            <PrimaryButton
              onClick={handleRegister}
              loading={isRegistering}
              disabled={
                !password || password !== confirmPw || password.length < 6
              }
            >
              Create account <ArrowRight size={15} />
            </PrimaryButton>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <button
          onClick={onSwitchToLogin}
          className="text-primary font-semibold hover:underline"
        >
          Sign in
        </button>
      </p>
    </div>
  );
}

// ─── ROOT ────────────────────────────────────────────────────────────────────────
export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
      <Background />

      <div className="w-full max-w-105">
        {/* Brand header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div
            className="inline-flex items-center justify-center w-13 h-13 rounded-[14px] mb-3.5"
            style={{
              width: 52,
              height: 52,
              background: "hsl(var(--primary))",
              boxShadow: "0 8px 32px hsl(var(--primary) / 0.35)",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                fill="white"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="text-[22px] font-bold text-foreground tracking-tight leading-none">
            Libas <span className="text-primary">TalentSpark</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Your talent, ignited.
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-7 shadow-2xl"
          style={{
            boxShadow:
              "0 24px 80px hsl(var(--background) / 0.6), inset 0 1px 0 hsl(var(--border) / 0.5)",
          }}
        >
          {/* Tab switcher */}
          <div className="flex bg-muted/50 border border-border rounded-[10px] p-1 mb-6">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`
                  flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200
                  ${
                    mode === m
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                {m === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Form area */}
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {mode === "login" ? (
                <LoginForm onSwitchToSignup={() => setMode("signup")} />
              ) : (
                <SignupForm onSwitchToLogin={() => setMode("login")} />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-5 text-xs text-muted-foreground/60"
        >
          Only <strong className="text-muted-foreground">@libas.in</strong>{" "}
          accounts are permitted
        </motion.p>
      </div>
    </div>
  );
}
