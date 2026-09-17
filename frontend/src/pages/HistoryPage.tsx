import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Bot,
  Clock3,
  FileText,
  Search,
  Sparkles,
  Workflow,
} from "lucide-react";

import toast from "react-hot-toast";

import {
  getHistory,
  type ActivityItem,
} from "../services/history";

import PageLoader from "../components/ui/PageLoader";

const iconFor = (
  type: ActivityItem["type"]
) => {
  if (type === "document_upload") {
    return FileText;
  }

  if (
    type === "workflow_generated" ||
    type === "workflow_step_updated"
  ) {
    return Workflow;
  }

  if (type === "agent_action") {
    return Bot;
  }

  return Sparkles;
};

export default function HistoryPage() {
  const [activities, setActivities] =
    useState<ActivityItem[]>([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    getHistory()
      .then(setActivities)
      .catch((error) =>
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to load history"
        )
      )
      .finally(() =>
        setLoading(false)
      );
  }, []);

  const filtered =
    useMemo(() => {
      const q =
        search.toLowerCase();

      return activities.filter(
        (item) =>
          item.title
            .toLowerCase()
            .includes(q) ||
          item.description
            .toLowerCase()
            .includes(q)
      );
    }, [
      activities,
      search,
    ]);

  if (loading) {
    return <PageLoader />;
  }

  return (
    <main className="history-page">
      <section className="history-heading">
        <div>
          <p className="section-kicker">
            ACTIVITY HISTORY
          </p>

          <h1>
            Workspace timeline
          </h1>

          <p>
            A chronological record of
            document, workflow and AI
            activity.
          </p>
        </div>
      </section>

      <div className="dashboard-search history-search">
        <Search size={17} />

        <input
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          placeholder="Search activity..."
        />
      </div>

      {filtered.length === 0 ? (
        <section className="documents-empty">
          <Clock3 size={30} />

          <h2>
            No activity yet
          </h2>

          <p>
            New uploads, workflows and
            AI actions will appear here.
          </p>
        </section>
      ) : (
        <section className="history-timeline">
          {filtered.map(
            (activity) => {
              const Icon =
                iconFor(
                  activity.type
                );

              return (
                <article
                  className="history-item"
                  key={activity._id}
                >
                  <div className="history-rail">
                    <div className="history-icon">
                      <Icon size={17} />
                    </div>

                    <div className="history-line" />
                  </div>

                  <div className="history-card">
                    <div className="history-card-top">
                      <span className="history-type">
                        {activity.type.replace(
                          "_",
                          " "
                        )}
                      </span>

                      <span className="history-time">
                        {new Intl.DateTimeFormat(
                          "en-GB",
                          {
                            dateStyle:
                              "medium",
                            timeStyle:
                              "short",
                          }
                        ).format(
                          new Date(
                            activity.createdAt
                          )
                        )}
                      </span>
                    </div>

                    <h3>
                      {activity.title}
                    </h3>

                    <p>
                      {
                        activity.description
                      }
                    </p>
                  </div>
                </article>
              );
            }
          )}
        </section>
      )}
    </main>
  );
}
