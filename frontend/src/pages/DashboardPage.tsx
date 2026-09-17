import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowRight,
  Bot,
  CheckCircle2,
  CircleAlert,
  FileText,
  Sparkles,
  Workflow,
} from "lucide-react";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Bar,
  BarChart,
} from "recharts";

import {
  motion,
} from "framer-motion";

import {
  useNavigate,
} from "react-router-dom";

import toast from "react-hot-toast";

import {
  fetchDocuments,
  fetchWorkflows,
  type DashboardDocument,
  type DashboardWorkflow,
} from "../services/dashboard";

import {
  Skeleton,
} from "../components/ui/Skeleton";

export default function DashboardPage() {
  const navigate = useNavigate();

  const [documents, setDocuments] =
    useState<DashboardDocument[]>([]);

  const [workflows, setWorkflows] =
    useState<DashboardWorkflow[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          documentData,
          workflowData,
        ] = await Promise.all([
          fetchDocuments(),
          fetchWorkflows(),
        ]);

        setDocuments(documentData);
        setWorkflows(workflowData);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to load dashboard";

        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const processedDocuments =
    documents.filter(
      (document) =>
        document.status === "processed"
    ).length;

  const failedDocuments =
    documents.filter(
      (document) =>
        document.status === "failed"
    ).length;

  const processingDocuments =
    documents.filter(
      (document) =>
        document.status === "processing"
    ).length;

  const activeWorkflows =
    workflows.filter(
      (workflow) =>
        workflow.status !== "completed"
    ).length;

  const workflowAnalytics = useMemo(() => {
    return workflows.slice(0, 6).map(
      (workflow) => {
        const completed =
          workflow.steps.filter(
            (step) =>
              step.status === "completed"
          ).length;

        const total =
          workflow.steps.length;

        const progress =
          total > 0
            ? Math.round(
                (completed / total) * 100
              )
            : 0;

        return {
          name:
            workflow.title.length > 20
              ? `${workflow.title.slice(
                  0,
                  20
                )}...`
              : workflow.title,
          progress,
        };
      }
    );
  }, [workflows]);

  const documentChart = [
    {
      name: "Processed",
      value: processedDocuments,
    },
    {
      name: "Failed",
      value: failedDocuments,
    },
    {
      name: "Processing",
      value: processingDocuments,
    },
  ];

  const totalWorkflowSteps =
    workflows.reduce(
      (count, workflow) =>
        count +
        workflow.steps.length,
      0
    );

  const completedWorkflowSteps =
    workflows.reduce(
      (count, workflow) =>
        count +
        workflow.steps.filter(
          (step) =>
            step.status === "completed"
        ).length,
      0
    );

  const overallWorkflowProgress =
    totalWorkflowSteps > 0
      ? Math.round(
          (completedWorkflowSteps /
            totalWorkflowSteps) *
            100
        )
      : 0;

  return (
    <main className="premium-dashboard">
      <section className="dashboard-page-heading">
        <div>
          <p className="section-kicker">
            AI COMMAND CENTRE
          </p>

          <h1>
            Workspace overview
          </h1>

          <p>
            Monitor documents, workflows and
            AI-powered activity from one
            intelligent dashboard.
          </p>
        </div>

        <button
          className="dashboard-primary"
          onClick={() =>
            navigate("/documents")
          }
        >
          Open documents
          <ArrowRight size={17} />
        </button>
      </section>

      {error && (
        <section className="dashboard-error-card">
          <CircleAlert size={20} />

          <div>
            <strong>
              Dashboard data unavailable
            </strong>

            <span>
              {error}
            </span>
          </div>
        </section>
      )}

      <motion.section
        initial={{
          opacity: 0,
          y: 15,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="premium-dashboard-hero"
      >
        <div className="dashboard-hero-copy">
          <div className="auth-chip">
            <Sparkles size={15} />
            MERN • GraphQL • RAG • Agents
          </div>

          <h2>
            Turn documents into
            <span>
              {" "}
              measurable action.
            </span>
          </h2>

          <p>
            Navigator AI combines document
            intelligence, semantic retrieval and
            controlled workflow automation in a
            single workspace.
          </p>

          <div className="hero-action-row">
            <button
              className="dashboard-primary"
              onClick={() =>
                navigate("/documents")
              }
            >
              Upload document
              <ArrowRight size={17} />
            </button>

            <button
              className="dashboard-secondary"
              onClick={() =>
                navigate("/assistant")
              }
            >
              <Bot size={17} />
              Ask Navigator AI
            </button>
          </div>
        </div>

        <div className="premium-ai-visual">
          <div className="ai-visual-ring ring-a" />
          <div className="ai-visual-ring ring-b" />
          <div className="ai-visual-ring ring-c" />

          <div className="ai-visual-core">
            <Bot size={50} />
          </div>

          <div className="ai-floating-card floating-rag">
            <span>RAG</span>
            <strong>
              Grounded answers
            </strong>
          </div>

          <div className="ai-floating-card floating-agent">
            <span>AGENT</span>
            <strong>
              Controlled actions
            </strong>
          </div>

          <div className="ai-floating-card floating-graphql">
            <span>GRAPHQL</span>
            <strong>
              Workflow state
            </strong>
          </div>
        </div>
      </motion.section>

      <section className="premium-stat-grid">
        {loading ? (
          <>
            <Skeleton className="premium-stat-skeleton" />
            <Skeleton className="premium-stat-skeleton" />
            <Skeleton className="premium-stat-skeleton" />
            <Skeleton className="premium-stat-skeleton" />
          </>
        ) : (
          <>
            <article className="premium-stat-card">
              <div className="premium-stat-icon">
                <FileText size={20} />
              </div>

              <div>
                <span>
                  Total documents
                </span>

                <strong>
                  {documents.length}
                </strong>

                <small>
                  Knowledge library
                </small>
              </div>
            </article>

            <article className="premium-stat-card">
              <div className="premium-stat-icon success">
                <CheckCircle2 size={20} />
              </div>

              <div>
                <span>
                  Processed
                </span>

                <strong>
                  {processedDocuments}
                </strong>

                <small>
                  Ready for RAG
                </small>
              </div>
            </article>

            <article className="premium-stat-card">
              <div className="premium-stat-icon">
                <Workflow size={20} />
              </div>

              <div>
                <span>
                  Active workflows
                </span>

                <strong>
                  {activeWorkflows}
                </strong>

                <small>
                  Process plans
                </small>
              </div>
            </article>

            <article className="premium-stat-card">
              <div className="premium-stat-icon">
                <Sparkles size={20} />
              </div>

              <div>
                <span>
                  Workflow progress
                </span>

                <strong>
                  {overallWorkflowProgress}%
                </strong>

                <small>
                  Across all steps
                </small>
              </div>
            </article>
          </>
        )}
      </section>

      <section className="analytics-grid">
        <article className="analytics-card">
          <div className="analytics-card-heading">
            <div>
              <p className="section-kicker">
                DOCUMENT HEALTH
              </p>

              <h3>
                Processing status
              </h3>
            </div>
          </div>

          {loading ? (
            <Skeleton className="chart-skeleton" />
          ) : documents.length === 0 ? (
            <div className="analytics-empty">
              No document data yet.
            </div>
          ) : (
            <div className="chart-wrapper">
              <ResponsiveContainer
                width="100%"
                height={280}
              >
                <PieChart>
                  <Pie
                    data={documentChart}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={72}
                    outerRadius={105}
                    paddingAngle={5}
                    stroke="none"
                  >
                    <Cell fill="#22c55e" />
                    <Cell fill="#ef4444" />
                    <Cell fill="#f59e0b" />
                  </Pie>

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="chart-center-label">
                <strong>
                  {documents.length}
                </strong>

                <span>
                  documents
                </span>
              </div>
            </div>
          )}

          <div className="chart-legend">
            <span>
              <i className="legend-dot processed-dot" />
              Processed {processedDocuments}
            </span>

            <span>
              <i className="legend-dot failed-dot" />
              Failed {failedDocuments}
            </span>

            <span>
              <i className="legend-dot processing-dot" />
              Processing {processingDocuments}
            </span>
          </div>
        </article>

        <article className="analytics-card">
          <div className="analytics-card-heading">
            <div>
              <p className="section-kicker">
                WORKFLOW ANALYTICS
              </p>

              <h3>
                Completion progress
              </h3>
            </div>

            <button
              className="analytics-link"
              onClick={() =>
                navigate("/workflows")
              }
            >
              View all
              <ArrowRight size={14} />
            </button>
          </div>

          {loading ? (
            <Skeleton className="chart-skeleton" />
          ) : workflowAnalytics.length === 0 ? (
            <div className="analytics-empty">
              No workflow data yet.
            </div>
          ) : (
            <ResponsiveContainer
              width="100%"
              height={280}
            >
              <BarChart
                data={workflowAnalytics}
                margin={{
                  top: 10,
                  right: 10,
                  left: -20,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  opacity={0.15}
                />

                <XAxis
                  dataKey="name"
                  tick={{
                    fontSize: 10,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  domain={[0, 100]}
                  tick={{
                    fontSize: 10,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip />

                <Bar
                  dataKey="progress"
                  radius={[
                    8,
                    8,
                    0,
                    0,
                  ]}
                  fill="#8b5cf6"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </article>
      </section>

      <section className="dashboard-data-grid">
        <article className="dashboard-data-card">
          <div className="analytics-card-heading">
            <div>
              <p className="section-kicker">
                RECENT DOCUMENTS
              </p>

              <h3>
                Knowledge library
              </h3>
            </div>

            <button
              className="analytics-link"
              onClick={() =>
                navigate("/documents")
              }
            >
              Manage
              <ArrowRight size={14} />
            </button>
          </div>

          {loading ? (
            <div className="dashboard-row-list">
              <Skeleton className="dashboard-row-skeleton" />
              <Skeleton className="dashboard-row-skeleton" />
              <Skeleton className="dashboard-row-skeleton" />
            </div>
          ) : documents.length === 0 ? (
            <div className="analytics-empty">
              No documents uploaded yet.
            </div>
          ) : (
            <div className="dashboard-row-list">
              {documents
                .slice(0, 5)
                .map((document) => (
                  <div
                    className="dashboard-data-row"
                    key={document._id}
                  >
                    <div className="dashboard-row-icon">
                      <FileText size={17} />
                    </div>

                    <div className="dashboard-row-copy">
                      <strong>
                        {document.filename}
                      </strong>

                      <span>
                        {document.pageCount
                          ? `${document.pageCount} pages`
                          : "PDF document"}
                      </span>
                    </div>

                    <span
                      className={`status-pill ${document.status}`}
                    >
                      {document.status}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </article>

        <article className="dashboard-data-card">
          <div className="analytics-card-heading">
            <div>
              <p className="section-kicker">
                RECENT WORKFLOWS
              </p>

              <h3>
                Action plans
              </h3>
            </div>

            <button
              className="analytics-link"
              onClick={() =>
                navigate("/workflows")
              }
            >
              Manage
              <ArrowRight size={14} />
            </button>
          </div>

          {loading ? (
            <div className="dashboard-row-list">
              <Skeleton className="dashboard-row-skeleton" />
              <Skeleton className="dashboard-row-skeleton" />
              <Skeleton className="dashboard-row-skeleton" />
            </div>
          ) : workflows.length === 0 ? (
            <div className="analytics-empty">
              No workflows generated yet.
            </div>
          ) : (
            <div className="dashboard-row-list">
              {workflows
                .slice(0, 5)
                .map((workflow) => {
                  const complete =
                    workflow.steps.filter(
                      (step) =>
                        step.status ===
                        "completed"
                    ).length;

                  const percentage =
                    workflow.steps.length
                      ? Math.round(
                          (complete /
                            workflow.steps.length) *
                            100
                        )
                      : 0;

                  return (
                    <div
                      className="dashboard-workflow-row"
                      key={workflow.id}
                    >
                      <div className="dashboard-row-icon">
                        <Workflow size={17} />
                      </div>

                      <div className="dashboard-row-copy">
                        <strong>
                          {workflow.title}
                        </strong>

                        <span>
                          {complete}/
                          {workflow.steps.length}{" "}
                          steps complete
                        </span>

                        <div className="mini-progress-track">
                          <div
                            className="mini-progress-fill"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>
                      </div>

                      <strong className="workflow-percentage">
                        {percentage}%
                      </strong>
                    </div>
                  );
                })}
            </div>
          )}
        </article>
      </section>
    </main>
  );
}
