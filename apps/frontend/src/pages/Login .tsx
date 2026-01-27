import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle, LogIn, Github } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string }>({});
  const [focusField, setFocusField] = useState<string | null>(null);

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log({ email, password });
    setIsLoading(false);
  };

  const handleInputFocus = (field: string) => {
    setFocusField(field);
    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleInputBlur = () => {
    setFocusField(null);
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
          <div className="h-1 bg-primary"></div>
          
          <div className="p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-4"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-3 overflow-hidden">
                <img 
                  src="../../../public/logo.jpg" 
                  alt="Libas TalentSpark" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h1 className="text-2xl font-semibold text-foreground mb-1">
                Libas TalentSpark
              </h1>
              <p className="text-muted-foreground text-sm">
                Sign in to your account
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                    focusField === 'email' || email ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => handleInputFocus('email')}
                    onBlur={handleInputBlur}
                    className={`
                      w-full pl-10 pr-10 py-2.5 rounded-lg border bg-background
                      transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20
                      ${formErrors.email 
                        ? 'border-destructive' 
                        : 'border-input focus:border-primary'
                      }
                    `}
                  />
                  {email && !formErrors.email && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      <CheckCircle className="text-primary" size={18} />
                    </motion.div>
                  )}
                </div>
                <AnimatePresence>
                  {formErrors.email && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-destructive text-xs mt-1.5 flex items-center gap-1"
                    >
                      <AlertCircle size={12} />
                      {formErrors.email}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-medium text-foreground">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                    focusField === 'password' || password ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => handleInputFocus('password')}
                    onBlur={handleInputBlur}
                    className={`
                      w-full pl-10 pr-10 py-2.5 rounded-lg border bg-background
                      transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20
                      ${formErrors.password 
                        ? 'border-destructive' 
                        : 'border-input focus:border-primary'
                      }
                    `}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <AnimatePresence>
                  {formErrors.password && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-destructive text-xs mt-1.5 flex items-center gap-1"
                    >
                      <AlertCircle size={12} />
                      {formErrors.password}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 text-primary rounded border-input focus:ring-2 focus:ring-primary/20"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-muted-foreground">
                  Remember me
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="
                  w-full py-1.5 px-4 rounded-lg font-medium text-primary-foreground
                  bg-primary hover:bg-primary/90 transition-colors
                  disabled:opacity-60 disabled:cursor-not-allowed
                  focus:outline-none focus:ring-2 focus:ring-primary/20
                "
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <LogIn size={18} />
                    Sign In
                  </span>
                )}
              </button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-card text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-input hover:bg-accent hover:border-primary/30 transition-colors text-sm font-medium text-foreground"
              >
                <Mail size={16} />
                Google
              </button>
              
              <button
                type="button"
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-input hover:bg-accent hover:border-primary/30 transition-colors text-sm font-medium text-foreground"
              >
                <Github size={16} />
                GitHub
              </button>
            </div>

            <div className="text-center mt-6 pt-6 border-t border-border">
              <p className="text-muted-foreground text-sm">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
            <div className="h-1 bg-primary"></div>
        </div>
      </motion.div>

      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/3 rounded-full blur-3xl opacity-40"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/3 rounded-full blur-3xl opacity-30"></div>
      </div>
    </div>
  );
}