import {
  AlertTriangle,
  Trash2,
  X,
} from "lucide-react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

type Props = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Delete",
  loading = false,
  onConfirm,
  onClose,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="confirm-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={() => {
            if (!loading) {
              onClose();
            }
          }}
        >
          <motion.section
            className="confirm-modal"
            initial={{
              opacity: 0,
              scale: 0.95,
              y: 15,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.96,
              y: 10,
            }}
            onMouseDown={(event) =>
              event.stopPropagation()
            }
            role="dialog"
            aria-modal="true"
          >
            <button
              className="confirm-close"
              onClick={onClose}
              disabled={loading}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="confirm-warning-icon">
              <AlertTriangle size={26} />
            </div>

            <p className="section-kicker">
              CONFIRM ACTION
            </p>

            <h2>{title}</h2>

            <p className="confirm-description">
              {description}
            </p>

            <div className="confirm-actions">
              <button
                className="dashboard-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>

              <button
                className="danger-button"
                onClick={onConfirm}
                disabled={loading}
              >
                <Trash2 size={16} />

                {loading
                  ? "Deleting..."
                  : confirmLabel}
              </button>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
