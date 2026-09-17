import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  Bot,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  Filter,
  Search,
  Sparkles,
  Workflow,
} from "lucide-react";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import {
  motion,
} from "framer-motion";

import {
  useNavigate,
} from "react-router-dom";

import toast from "react-hot-toast";

import {
  getMyWorkflows,
  updateWorkflowStepStatus,
  type StepStatus,
  type WorkflowItem,
} from "../services/workflows";

import {
  ThemeSwitcher,
} from "../components/ui/ThemeSwitcher";

import {
  Skeleton,
} from "../components/ui/Skeleton";

import {
  logHistory,
} from "../services/history";

const statusOptions: {
  value: StepStatus;
  label: string;
}[] = [
  {
    value: "pending",
    label: "Pending",
  },
  {
    value: "in_progress",
    label: "In progress",
  },
  {
    value: "completed",
    label: "Completed",
  },
];

export default function WorkflowsPage() {
  const navigate = useNavigate();

  const [workflows, setWorkflows] =
    useState<WorkflowItem[]>([]);

  const [selectedId, setSelectedId] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("all");

  const [updatingStep, setUpdatingStep] =
    useState<string | null>(null);

  const loadWorkflows = async () => {
    try {
      setLoading(true);

      const data = await getMyWorkflows();

      setWorkflows(data);

      if (
        !selectedId &&
        data.length > 0
      ) {
        setSelectedId(data[0].id);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load workflows"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  const filteredWorkflows =
    useMemo(() => {
      const query = search
        .trim()
        .toLowerCase();

      return workflows.filter(
        (workflow) => {
          const matchesSearch =
            !query ||
            workflow.title
              .toLowerCase()
              .includes(query) ||
            workflow.summary
              ?.toLowerCase()
              .includes(query);

          const matchesFilter =
            filter === "all" ||
            workflow.status === filter;

          return (
            matchesSearch &&
            matchesFilter
          );
        }
      );
    }, [
      workflows,
      search,
      filter,
    ]);

  const selectedWorkflow =
    workflows.find(
      (workflow) =>
        workflow.id === selectedId
    ) ?? null;

  const completedSteps =
    selectedWorkflow?.steps.filter(
      (step) =>
        step.status === "completed"
    ).length ?? 0;

  const inProgressSteps =
    selectedWorkflow?.steps.filter(
      (step) =>
        step.status ===
        "in_progress"
    ).length ?? 0;

  const pendingSteps =
    selectedWorkflow?.steps.filter(
      (step) =>
        step.status === "pending"
    ).length ?? 0;

  const totalSteps =
    selectedWorkflow?.steps.length ?? 0;

  const progress =
    totalSteps > 0
      ? Math.round(
          (completedSteps /
            totalSteps) *
            100
        )
      : 0;

  const chartData = [
    {
      name: "Completed",
      value: completedSteps,
    },
    {
      name: "In Progress",
      value: inProgressSteps,
    },
    {
      name: "Pending",
      value: pendingSteps,
    },
  ];

  const changeStepStatus = async (
    workflowId: string,
    stepOrder: number,
    status: StepStatus
  ) => {
    const key =
      `${workflowId}-${stepOrder}`;

    try {
      setUpdatingStep(key);

      const updated =
        await updateWorkflowStepStatus(
          workflowId,
          stepOrder,
          status
        );

      setWorkflows(
        (current) =>
          current.map((workflow) =>
            workflow.id === updated.id
              ? updated
              : workflow
          )
      );

      try {
        await logHistory(
          "workflow_step_updated",
          "Workflow step updated",
          `Step ${stepOrder} was changed to ${status.replace(
            "_",
            " "
          )}.`,
          {
            workflowId,
            stepOrder,
            status,
          }
        );
      } catch {
        // GraphQL update itself remains successful.
      }

      toast.success(
        `Step ${stepOrder} changed to ${status.replace(
          "_",
          " "
        )}.`
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update step"
      );
    } finally {
      setUpdatingStep(null);
    }
  };

  return (
    <main className="workflow-page">
      <header className="workflow-header">
        <div>
          <button
            className="back-workspace-button"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            <ArrowLeft size={16} />
            Dashboard
          </button>

          <p className="section-kicker">
            AI WORKFLOWS
          </p>

          <h1>
            From document to action
          </h1>

          <p>
            Review AI-generated process
            plans, update progress and
            manage every next step.
          </p>
        </div>

        <ThemeSwitcher />
      </header>

      <section className="workflow-toolbar">
        <div className="dashboard-search workflow-search">
          <Search size={17} />

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search workflows..."
          />
        </div>

        <label className="select-control">
          <Filter size={16} />

          <select
            value={filter}
            onChange={(event) =>
              setFilter(
                event.target.value
              )
            }
          >
            <option value="all">
              All workflows
            </option>

            <option value="draft">
              Draft
            </option>

            <option value="active">
              Active
            </option>

            <option value="completed">
              Completed
            </option>
          </select>
        </label>
      </section>

      {loading ? (
        <section className="workflow-layout">
          <div className="workflow-sidebar-panel">
            <Skeleton className="workflow-list-skeleton" />
            <Skeleton className="workflow-list-skeleton" />
            <Skeleton className="workflow-list-skeleton" />
          </div>

          <Skeleton className="workflow-main-skeleton" />
        </section>
      ) : workflows.length === 0 ? (
        <section className="documents-empty">
          <div className="documents-empty-icon">
            <Workflow size={30} />
          </div>

          <h2>
            No workflows yet
          </h2>

          <p>
            Generate your first workflow
            from a processed document.
          </p>

          <button
            className="dashboard-primary"
            onClick={() =>
              navigate("/documents")
            }
          >
            <Sparkles size={17} />
            Open documents
          </button>
        </section>
      ) : (
        <section className="workflow-layout">
          <aside className="workflow-sidebar-panel">
            <div className="workflow-sidebar-title">
              <span>
                Your workflows
              </span>

              <strong>
                {
                  filteredWorkflows.length
                }
              </strong>
            </div>

            <div className="workflow-selector-list">
              {filteredWorkflows.map(
                (workflow) => {
                  const completed =
                    workflow.steps.filter(
                      (step) =>
                        step.status ===
                        "completed"
                    ).length;

                  const itemProgress =
                    workflow.steps.length
                      ? Math.round(
                          (completed /
                            workflow.steps
                              .length) *
                            100
                        )
                      : 0;

                  return (
                    <button
                      key={workflow.id}
                      className={
                        selectedId ===
                        workflow.id
                          ? "workflow-selector active"
                          : "workflow-selector"
                      }
                      onClick={() =>
                        setSelectedId(
                          workflow.id
                        )
                      }
                    >
                      <div className="workflow-selector-icon">
                        <Workflow size={17} />
                      </div>

                      <div>
                        <strong>
                          {workflow.title}
                        </strong>

                        <span>
                          {workflow.steps.length}{" "}
                          steps •{" "}
                          {itemProgress}%
                        </span>
                      </div>
                    </button>
                  );
                }
              )}
            </div>
          </aside>

          {selectedWorkflow && (
            <motion.section
              key={selectedWorkflow.id}
              initial={{
                opacity: 0,
                y: 12,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="workflow-main-panel"
            >
              <div className="workflow-detail-header">
                <div>
                  <div className="workflow-title-row">
                    <div className="workflow-title-icon">
                      <Sparkles size={19} />
                    </div>

                    <span
                      className={`workflow-status-badge ${selectedWorkflow.status}`}
                    >
                      {
                        selectedWorkflow.status
                      }
                    </span>
                  </div>

                  <h2>
                    {
                      selectedWorkflow.title
                    }
                  </h2>

                  <p>
                    {
                      selectedWorkflow.summary
                    }
                  </p>
                </div>

                <div className="workflow-chart-card">
                  <ResponsiveContainer
                    width="100%"
                    height={170}
                  >
                    <PieChart>
                      <Pie
                        data={
                          chartData
                        }
                        dataKey="value"
                        innerRadius={53}
                        outerRadius={72}
                        paddingAngle={4}
                        stroke="none"
                      >
                        {chartData.map(
                          (
                            _,
                            index
                          ) => (
                            <Cell
                              key={
                                index
                              }
                              fill={
                                index ===
                                0
                                  ? "#22c55e"
                                  : index ===
                                      1
                                    ? "#8b5cf6"
                                    : "#64748b"
                              }
                            />
                          )
                        )}
                      </Pie>

                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="workflow-chart-center">
                    <strong>
                      {progress}%
                    </strong>

                    <span>
                      complete
                    </span>
                  </div>
                </div>
              </div>

              <section className="workflow-summary-grid">
                <article>
                  <CheckCircle2 size={18} />

                  <div>
                    <span>
                      Completed
                    </span>

                    <strong>
                      {completedSteps}
                    </strong>
                  </div>
                </article>

                <article>
                  <Clock3 size={18} />

                  <div>
                    <span>
                      In progress
                    </span>

                    <strong>
                      {inProgressSteps}
                    </strong>
                  </div>
                </article>

                <article>
                  <Circle size={18} />

                  <div>
                    <span>
                      Pending
                    </span>

                    <strong>
                      {pendingSteps}
                    </strong>
                  </div>
                </article>
              </section>

              <div className="workflow-progress-large">
                <div>
                  <strong>
                    Overall progress
                  </strong>

                  <span>
                    {completedSteps} of{" "}
                    {totalSteps} steps
                  </span>
                </div>

                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>
              </div>

              <section className="workflow-timeline">
                <div className="timeline-heading">
                  <div>
                    <p className="section-kicker">
                      ACTION PLAN
                    </p>

                    <h3>
                      Workflow steps
                    </h3>
                  </div>

                  <div className="ai-generated-pill">
                    <Bot size={14} />
                    AI generated
                  </div>
                </div>

                {selectedWorkflow.steps.map(
                  (step) => {
                    const updateKey =
                      `${selectedWorkflow.id}-${step.order}`;

                    return (
                      <motion.article
                        key={step.order}
                        initial={{
                          opacity: 0,
                          x: 12,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                        }}
                        className={`timeline-step ${step.status}`}
                      >
                        <div className="timeline-rail">
                          <div className="timeline-number">
                            {step.status ===
                            "completed" ? (
                              <Check size={16} />
                            ) : (
                              step.order
                            )}
                          </div>

                          <div className="timeline-line" />
                        </div>

                        <div className="timeline-content">
                          <div className="timeline-step-heading">
                            <div>
                              <span>
                                STEP{" "}
                                {step.order
                                  .toString()
                                  .padStart(
                                    2,
                                    "0"
                                  )}
                              </span>

                              <h4>
                                {
                                  step.title
                                }
                              </h4>
                            </div>

                            <select
                              className={`step-status-select ${step.status}`}
                              value={
                                step.status
                              }
                              disabled={
                                updatingStep ===
                                updateKey
                              }
                              onChange={(
                                event
                              ) =>
                                changeStepStatus(
                                  selectedWorkflow.id,
                                  step.order,
                                  event
                                    .target
                                    .value as StepStatus
                                )
                              }
                            >
                              {statusOptions.map(
                                (
                                  option
                                ) => (
                                  <option
                                    key={
                                      option.value
                                    }
                                    value={
                                      option.value
                                    }
                                  >
                                    {
                                      option.label
                                    }
                                  </option>
                                )
                              )}
                            </select>
                          </div>

                          {step.description && (
                            <p>
                              {
                                step.description
                              }
                            </p>
                          )}

                          {step
                            .sourceChunkIndexes
                            ?.length ? (
                            <div className="source-chunks">
                              <Sparkles size={13} />

                              <span>
                                Grounded in
                                source{" "}
                                {step.sourceChunkIndexes.map(
                                  (
                                    chunk
                                  ) =>
                                    `#${chunk}`
                                ).join(
                                  ", "
                                )}
                              </span>
                            </div>
                          ) : null}
                        </div>
                      </motion.article>
                    );
                  }
                )}
              </section>
            </motion.section>
          )}
        </section>
      )}
    </main>
  );
}
