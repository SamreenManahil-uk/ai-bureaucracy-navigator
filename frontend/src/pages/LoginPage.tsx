import {
  useState,
  type FormEvent,
} from "react";

import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { motion } from "framer-motion";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import toast from "react-hot-toast";

import { login } from "../services/auth";
import { useAuth } from "../context/AuthContext";
import { ThemeSwitcher } from "../components/ui/ThemeSwitcher";
import AuthCarousel from "../components/ui/AuthCarousel";

export default function LoginPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();

  const [email, setEmail] = useState(
    "samreen@example.com"
  );

  const [password, setPassword] = useState(
    "Password123"
  );

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const submit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!email.trim() || !password) {
      toast.error(
        "Please enter your email and password."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await login(
        email.trim(),
        password
      );

      setSession(
        response.token,
        response.user
      );

      toast.success(
        `Welcome back, ${response.user.name}.`
      );

      navigate("/dashboard");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-glow auth-glow-one" />
      <div className="auth-glow auth-glow-two" />

      <section className="auth-brand-panel">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="auth-brand-inner"
        >
          <div className="brand-row">
            <div className="brand-mark">
              <Bot size={24} />
            </div>

            <div>
              <p className="brand-eyebrow">
                BN
              </p>
              <h1 className="brand-name">
                Navigator AI
              </h1>
            </div>
          </div>

          <div className="auth-product-copy">
            <div className="auth-chip">
              <Sparkles size={15} />
              Action intelligence
            </div>

            <h2>
              Turn complexity into
              <span> clear next steps.</span>
            </h2>

            <p>
              Upload complex documents, retrieve
              grounded evidence and let AI turn
              bureaucracy into manageable workflows.
            </p>
          </div>

          <AuthCarousel />

          <div className="auth-feature-list">
            <div>
              <CheckCircle2 size={18} />
              <span>
                Grounded RAG from uploaded documents
              </span>
            </div>

            <div>
              <CheckCircle2 size={18} />
              <span>
                AI-generated structured workflows
              </span>
            </div>

            <div>
              <CheckCircle2 size={18} />
              <span>
                Controlled agent actions and GraphQL
              </span>
            </div>
          </div>

          <div className="security-card">
            <div className="security-icon">
              <ShieldCheck size={21} />
            </div>

            <div>
              <strong>
                Protected intelligent workspace
              </strong>

              <p>
                JWT authentication, ownership
                enforcement and role-based controls.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-topbar">
          <ThemeSwitcher />
        </div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.08,
          }}
          className="auth-form-card"
        >
          <div className="auth-form-heading">
            <p className="section-kicker">
              SECURE WORKSPACE
            </p>

            <h2>Welcome back</h2>

            <p>
              Sign in to continue to your
              intelligent workflow workspace.
            </p>
          </div>

          <form
            onSubmit={submit}
            className="auth-form"
          >
            <label className="field-group">
              <span>Email address</span>

              <div className="field-shell">
                <Mail size={18} />

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </label>

            <label className="field-group">
              <span>Password</span>

              <div className="field-shell">
                <LockKeyhole size={18} />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  onClick={() =>
                    setShowPassword(
                      (current) => !current
                    )
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </label>

            <div className="auth-form-row">
              <label className="remember-row">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="text-button"
                onClick={() =>
                  toast(
                    "Password recovery will be added later."
                  )
                }
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="primary-auth-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="button-spinner" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in to workspace
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span />
            <p>New to Navigator AI?</p>
            <span />
          </div>

          <Link
            to="/register"
            className="secondary-auth-button"
          >
            Register
          </Link>

          <Link
            to="/admin/login"
            className="admin-login-link"
          >
            <ShieldCheck size={16} />
            Administrator login
          </Link>

          <p className="auth-legal">
            Portfolio prototype only. Not an official
            government, legal, immigration or university
            advisory service.
          </p>
        </motion.div>
      </section>
    </main>
  );
}
