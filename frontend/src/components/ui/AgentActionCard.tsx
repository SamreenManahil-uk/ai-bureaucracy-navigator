import {
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";

type Props = {
  title: string;
  description: string;
  loading?: boolean;
  completed?: boolean;
  error?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
};

export default function AgentActionCard({
  title,
  description,
  loading = false,
  completed = false,
  error = false,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <div
      className={`agent-action-card ${
        completed
          ? "completed"
          : error
            ? "error"
            : ""
      }`}
    >
      <div className="agent-action-icon">
        {completed ? (
          <CheckCircle2 size={20} />
        ) : error ? (
          <XCircle size={20} />
        ) : (
          <ShieldCheck size={20} />
        )}
      </div>

      <div className="agent-action-content">
        <div className="agent-action-label">
          <Sparkles size={13} />
          CONTROLLED ACTION
        </div>

        <strong>{title}</strong>

        <p>{description}</p>

        {!completed &&
          !error &&
          onConfirm &&
          onCancel && (
            <div className="agent-action-buttons">
              <button
                className="dashboard-secondary"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </button>

              <button
                className="dashboard-primary"
                onClick={onConfirm}
                disabled={loading}
              >
                {loading
                  ? "Running action..."
                  : "Confirm action"}
              </button>
            </div>
          )}
      </div>
    </div>
  );
}
