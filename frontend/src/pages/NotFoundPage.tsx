import {
  ArrowLeft,
  Bot,
  Home,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  motion,
} from "framer-motion";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <main className="not-found-page">
      <motion.section
        initial={{
          opacity: 0,
          scale: 0.96,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        className="not-found-card"
      >
        <div className="not-found-visual">
          <span>4</span>

          <div className="not-found-ai">
            <Bot size={42} />
          </div>

          <span>4</span>
        </div>

        <p className="section-kicker">
          ROUTE NOT FOUND
        </p>

        <h1>
          This page wandered outside the workflow.
        </h1>

        <p>
          The route you requested does not
          exist in this Navigator AI workspace.
        </p>

        <div className="not-found-actions">
          <button
            className="dashboard-primary"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            <Home size={17} />
            Dashboard
          </button>

          <button
            className="dashboard-secondary"
            onClick={() =>
              navigate(-1)
            }
          >
            <ArrowLeft size={17} />
            Go back
          </button>
        </div>
      </motion.section>
    </main>
  );
}
