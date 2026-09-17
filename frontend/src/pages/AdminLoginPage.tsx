import {
  useState,
  type FormEvent,
} from "react";

import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import toast from "react-hot-toast";

import {
  login,
} from "../services/auth";

import {
  useAuth,
} from "../context/AuthContext";

import {
  ThemeSwitcher,
} from "../components/ui/ThemeSwitcher";

export default function AdminLoginPage() {
  const navigate = useNavigate();

  const {
    setSession,
  } = useAuth();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const submit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!email.trim() || !password) {
      toast.error(
        "Enter admin email and password."
      );
      return;
    }

    try {
      setLoading(true);

      const response =
        await login(
          email.trim(),
          password
        );

      if (
        response.user.role !== "ADMIN"
      ) {
        throw new Error(
          "This account does not have administrator access."
        );
      }

      setSession(
        response.token,
        response.user
      );

      toast.success(
        "Administrator access granted."
      );

      navigate("/admin");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Admin login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-login-page">
      <div className="admin-login-glow" />

      <header className="admin-login-topbar">
        <Link
          to="/login"
          className="back-link"
        >
          <ArrowLeft size={16} />
          User login
        </Link>

        <ThemeSwitcher />
      </header>

      <section className="admin-login-card">
        <div className="admin-login-icon">
          <ShieldCheck size={30} />
        </div>

        <p className="section-kicker">
          SECURE ADMINISTRATION
        </p>

        <h1>
          Admin access
        </h1>

        <p className="admin-login-subtitle">
          Sign in with an authorised
          administrator account to access
          platform controls and system
          analytics.
        </p>

        <form
          className="auth-form"
          onSubmit={submit}
        >
          <label className="field-group">
            <span>
              Administrator email
            </span>

            <div className="field-shell">
              <Mail size={18} />

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                placeholder="admin@example.com"
                autoComplete="email"
              />
            </div>
          </label>

          <label className="field-group">
            <span>
              Password
            </span>

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
                  setPassword(
                    event.target.value
                  )
                }
                placeholder="Enter password"
                autoComplete="current-password"
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(
                    (current) =>
                      !current
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
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

          <button
            type="submit"
            className="primary-auth-button"
            disabled={loading}
          >
            {loading
              ? "Verifying access..."
              : "Sign in as administrator"}
          </button>
        </form>

        <div className="admin-security-note">
          <ShieldCheck size={18} />

          <p>
            Administrator accounts cannot
            be created through public
            registration. Access is granted
            only to authorised accounts.
          </p>
        </div>
      </section>
    </main>
  );
}
