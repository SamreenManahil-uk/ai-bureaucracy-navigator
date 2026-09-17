import {
  useState,
  type FormEvent,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  Bot,
  LockKeyhole,
  Mail,
  Sparkles,
  UserRound,
} from "lucide-react";

import { motion } from "framer-motion";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import toast from "react-hot-toast";

import { register } from "../services/auth";
import { useAuth } from "../context/AuthContext";
import { ThemeSwitcher } from "../components/ui/ThemeSwitcher";
import AuthCarousel from "../components/ui/AuthCarousel";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const submit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      toast.error(
        "Please complete all required fields."
      );
      return;
    }

    if (password.length < 8) {
      toast.error(
        "Password must be at least 8 characters."
      );
      return;
    }

    if (!/[a-z]/.test(password)) {
      toast.error(
        "Password needs at least one lowercase letter."
      );
      return;
    }

    if (!/[A-Z]/.test(password)) {
      toast.error(
        "Password needs at least one uppercase letter."
      );
      return;
    }

    if (!/[0-9]/.test(password)) {
      toast.error(
        "Password needs at least one number."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await register(
        name.trim(),
        email.trim(),
        password
      );

      setSession(
        response.token,
        response.user
      );

      toast.success(
        "Your Navigator AI workspace is ready."
      );

      navigate("/dashboard");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Registration failed"
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
              Intelligent action workspace
            </div>

            <h2>
              Build your
              <span> action workspace.</span>
            </h2>

            <p>
              Organise documents, generate grounded
              workflows and manage complex processes
              through one intelligent interface.
            </p>
          </div>

          <AuthCarousel />

          <div className="register-preview-card">
            <p>YOUR WORKSPACE</p>

            <div className="preview-stat-row">
              <div>
                <strong>RAG</strong>
                <span>Grounded answers</span>
              </div>

              <div>
                <strong>AI Agent</strong>
                <span>Controlled actions</span>
              </div>

              <div>
                <strong>GraphQL</strong>
                <span>Workflow control</span>
              </div>
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
          className="auth-form-card"
        >
          <Link
            to="/login"
            className="back-link"
          >
            <ArrowLeft size={16} />
            Back to login
          </Link>

          <div className="auth-form-heading">
            <p className="section-kicker">
              CREATE WORKSPACE
            </p>

            <h2>Create account</h2>

            <p>
              Start building intelligent,
              document-to-action workflows.
            </p>
          </div>

          <form
            onSubmit={submit}
            className="auth-form"
          >
            <label className="field-group">
              <span>Full name</span>

              <div className="field-shell">
                <UserRound size={18} />

                <input
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Your full name"
                />
              </div>
            </label>

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
                />
              </div>
            </label>

            <label className="field-group">
              <span>Password</span>

              <div className="field-shell">
                <LockKeyhole size={18} />

                <input
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Minimum 8 characters"
                />
              </div>
            </label>

            <button
              type="submit"
              className="primary-auth-button"
              disabled={loading}
            >
              {loading
                ? "Creating workspace..."
                : "Create workspace"}

              {!loading && (
                <ArrowRight size={18} />
              )}
            </button>
          </form>
        </motion.div>
      </section>
    </main>
  );
}
