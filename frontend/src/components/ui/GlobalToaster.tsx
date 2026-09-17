import {
  CheckCircle2,
  CircleAlert,
  Info,
  X,
} from "lucide-react";

import {
  Toaster,
  ToastBar,
  toast,
} from "react-hot-toast";

export default function GlobalToaster() {
  return (
    <Toaster
      position="top-right"
      gutter={10}
      toastOptions={{
        duration: 3500,
        style: {
          padding: 0,
          background: "transparent",
          boxShadow: "none",
          maxWidth: "420px",
        },
      }}
    >
      {(t) => (
        <ToastBar toast={t}>
          {({ message }) => {
            const Icon =
              t.type === "success"
                ? CheckCircle2
                : t.type === "error"
                  ? CircleAlert
                  : Info;

            return (
              <div
                className={`premium-toast ${t.type}`}
              >
                <div className="premium-toast-icon">
                  <Icon size={18} />
                </div>

                <div className="premium-toast-message">
                  {message}
                </div>

                <button
                  className="premium-toast-close"
                  onClick={() =>
                    toast.dismiss(t.id)
                  }
                  aria-label="Close notification"
                >
                  <X size={15} />
                </button>
              </div>
            );
          }}
        </ToastBar>
      )}
    </Toaster>
  );
}
