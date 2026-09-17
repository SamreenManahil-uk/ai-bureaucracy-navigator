import {
  Bot,
} from "lucide-react";

export default function PageLoader() {
  return (
    <div
      className="page-loader"
      role="status"
      aria-label="Loading page"
    >
      <div className="page-loader-core">
        <Bot size={28} />
      </div>

      <div className="page-loader-copy">
        <strong>
          Navigator AI
        </strong>

        <span>
          Loading workspace...
        </span>
      </div>

      <div className="page-loader-track">
        <div />
      </div>
    </div>
  );
}
