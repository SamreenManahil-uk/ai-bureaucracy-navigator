import {
  CalendarDays,
  FileText,
  HardDrive,
  Hash,
  Layers3,
  Sparkles,
  X,
} from "lucide-react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import type {
  DashboardDocument,
} from "../../services/dashboard";

type Props = {
  document: DashboardDocument | null;
  open: boolean;
  generating?: boolean;
  onClose: () => void;
  onGenerateWorkflow: (
    documentId: string
  ) => void;
};

const formatBytes = (
  bytes?: number
) => {
  if (!bytes) {
    return "Not available";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(
      bytes / 1024
    ).toFixed(1)} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(2)} MB`;
};

const formatDate = (
  value?: string
) => {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(
    new Date(value)
  );
};

export default function DocumentDetailsDrawer({
  document,
  open,
  generating = false,
  onClose,
  onGenerateWorkflow,
}: Props) {
  return (
    <AnimatePresence>
      {open && document && (
        <>
          <motion.div
            className="drawer-backdrop"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            onClick={onClose}
          />

          <motion.aside
            className="document-drawer"
            initial={{
              x: "100%",
            }}
            animate={{
              x: 0,
            }}
            exit={{
              x: "100%",
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 32,
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Document details"
          >
            <div className="drawer-header">
              <div>
                <p className="section-kicker">
                  DOCUMENT DETAILS
                </p>

                <h2>
                  Document intelligence
                </h2>
              </div>

              <button
                className="drawer-close"
                onClick={onClose}
                aria-label="Close document details"
              >
                <X size={19} />
              </button>
            </div>

            <div className="drawer-document-hero">
              <div className="drawer-file-icon">
                <FileText size={26} />
              </div>

              <div>
                <span
                  className={`status-pill ${document.status}`}
                >
                  {document.status}
                </span>

                <h3>
                  {document.filename}
                </h3>

                <p>
                  Uploaded knowledge source
                  used by Navigator AI.
                </p>
              </div>
            </div>

            <div className="drawer-details-grid">
              <article>
                <div className="drawer-detail-icon">
                  <Hash size={17} />
                </div>

                <span>
                  Document ID
                </span>

                <strong
                  title={document._id}
                >
                  {document._id}
                </strong>
              </article>

              <article>
                <div className="drawer-detail-icon">
                  <Layers3 size={17} />
                </div>

                <span>
                  Pages
                </span>

                <strong>
                  {document.pageCount ??
                    "Not available"}
                </strong>
              </article>

              <article>
                <div className="drawer-detail-icon">
                  <HardDrive size={17} />
                </div>

                <span>
                  File size
                </span>

                <strong>
                  {formatBytes(
                    document.fileSize
                  )}
                </strong>
              </article>

              <article>
                <div className="drawer-detail-icon">
                  <CalendarDays size={17} />
                </div>

                <span>
                  Uploaded
                </span>

                <strong>
                  {formatDate(
                    document.createdAt
                  )}
                </strong>
              </article>
            </div>

            <section className="drawer-intelligence-card">
              <div className="drawer-intelligence-icon">
                <Sparkles size={20} />
              </div>

              <div>
                <strong>
                  AI readiness
                </strong>

                <p>
                  {document.status ===
                  "processed"
                    ? "This document is processed and available for grounded retrieval and workflow generation."
                    : document.status ===
                        "failed"
                      ? "Processing failed for this document. Upload the source again before using AI features."
                      : "This document is still being processed."}
                </p>
              </div>
            </section>

            <div className="drawer-actions">
              <button
                className="dashboard-secondary"
                onClick={onClose}
              >
                Close
              </button>

              <button
                className="dashboard-primary"
                disabled={
                  document.status !==
                    "processed" ||
                  generating
                }
                onClick={() =>
                  onGenerateWorkflow(
                    document._id
                  )
                }
              >
                <Sparkles size={16} />

                {generating
                  ? "Generating..."
                  : "Generate workflow"}
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
