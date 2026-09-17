import {
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ArrowLeft,
  Bot,
  BrainCircuit,
  FileSearch,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
  Zap,
} from "lucide-react";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import {
  useNavigate,
} from "react-router-dom";

import toast from "react-hot-toast";

import {
  askAgent,
  askRag,
  type AssistantMode,
  type SourceChunk,
} from "../services/assistant";

import {
  logHistory,
} from "../services/history";

import {
  ThemeSwitcher,
} from "../components/ui/ThemeSwitcher";

import AgentActionCard from "../components/ui/AgentActionCard";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  mode?: AssistantMode;
  sources?: SourceChunk[];
};

const ragPrompts = [
  "What documents do I need before applying?",
  "Summarise the application process.",
  "What should I do after submitting the application?",
];

const agentPrompts = [
  "Show me my workflows.",
  "Mark step 1 of my workflow as completed.",
  "What workflow actions can you perform for me?",
];

export default function AssistantPage() {
  const navigate = useNavigate();

  const [mode, setMode] =
    useState<AssistantMode>("rag");

  const [input, setInput] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [pendingAgentAction, setPendingAgentAction] =
    useState<{
      message: string;
      description: string;
    } | null>(null);

  const [messages, setMessages] =
    useState<ChatMessage[]>([
      {
        id: "welcome",
        role: "assistant",
        text:
          "Welcome to Navigator AI. Use RAG mode for grounded document questions, or Agent mode for controlled workflow actions.",
        mode: "rag",
      },
    ]);

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

  const suggestions = useMemo(
    () =>
      mode === "rag"
        ? ragPrompts
        : agentPrompts,
    [mode]
  );

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }, 50);
  };

  const sendMessage = async (
    override?: string
  ) => {
    const message =
      (override ?? input).trim();

    if (!message || loading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: message,
      mode,
    };

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setInput("");
    setLoading(true);
    scrollToBottom();

    try {
      if (mode === "agent") {
        const lower = message.toLowerCase();

        const changingAction =
          lower.includes("mark") ||
          lower.includes("complete") ||
          lower.includes("in progress") ||
          lower.includes("update") ||
          lower.includes("change");

        if (changingAction) {
          setPendingAgentAction({
            message,
            description:
              "Navigator AI detected a workflow-changing action. Confirm before allowing the agent to modify workflow state.",
          });

          setLoading(false);
          scrollToBottom();
          return;
        }
      }

      const response =
        mode === "rag"
          ? await askRag(message)
          : await askAgent(message);

      try {
        if (mode === "rag") {
          await logHistory(
            "rag_question",
            "Grounded AI question",
            message,
            {
              sourceCount:
                response.sources?.length ?? 0,
            }
          );
        } else {
          await logHistory(
            "agent_action",
            "AI Agent interaction",
            message,
            {
              response:
                response.answer.slice(0, 300),
            }
          );
        }
      } catch {
        // Do not interrupt the AI response if history logging fails.
      }

      const assistantMessage: ChatMessage =
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: response.answer,
          mode,
          sources: response.sources,
        };

      setMessages((current) => [
        ...current,
        assistantMessage,
      ]);

      if (mode === "agent") {
        toast.success(
          "Agent response completed."
        );
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Assistant request failed"
      );

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text:
            "I could not complete that request. Check that the backend and local AI models are running, then try again.",
          mode,
        },
      ]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  const confirmAgentAction = async () => {
    if (!pendingAgentAction) {
      return;
    }

    try {
      setLoading(true);

      const response = await askAgent(
        pendingAgentAction.message
      );

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: response.answer,
          mode: "agent",
        },
      ]);

      try {
        await logHistory(
          "agent_action",
          "Confirmed AI Agent action",
          pendingAgentAction.message,
          {
            result: response.answer.slice(
              0,
              300
            ),
          }
        );
      } catch {
        // Agent action itself should still succeed.
      }

      toast.success(
        "Agent action completed."
      );

      setPendingAgentAction(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Agent action failed"
      );
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  return (
    <main className="assistant-page">
      <header className="assistant-header">
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
            NAVIGATOR INTELLIGENCE
          </p>

          <h1>
            AI Assistant
          </h1>

          <p>
            Ask grounded questions or let the
            controlled agent perform workflow
            actions.
          </p>
        </div>

        <ThemeSwitcher />
      </header>

      <section className="assistant-shell">
        <aside className="assistant-control-panel">
          <p className="assistant-control-label">
            INTELLIGENCE MODE
          </p>

          <button
            className={
              mode === "rag"
                ? "assistant-mode-card active"
                : "assistant-mode-card"
            }
            onClick={() =>
              setMode("rag")
            }
          >
            <div className="assistant-mode-icon">
              <FileSearch size={20} />
            </div>

            <div>
              <strong>
                Grounded RAG
              </strong>

              <span>
                Ask questions from uploaded
                documents.
              </span>
            </div>
          </button>

          <button
            className={
              mode === "agent"
                ? "assistant-mode-card active"
                : "assistant-mode-card"
            }
            onClick={() =>
              setMode("agent")
            }
          >
            <div className="assistant-mode-icon">
              <BrainCircuit size={20} />
            </div>

            <div>
              <strong>
                Action Agent
              </strong>

              <span>
                Perform controlled workflow
                operations.
              </span>
            </div>
          </button>

          <div className="assistant-security-card">
            <ShieldCheck size={20} />

            <div>
              <strong>
                Controlled actions
              </strong>

              <span>
                Agent tools are allow-listed
                and ownership protected.
              </span>
            </div>
          </div>

          <div className="assistant-tech-stack">
            <span>
              Ollama
            </span>

            <span>
              Embeddings
            </span>

            <span>
              GraphQL
            </span>

            <span>
              Tool Calling
            </span>
          </div>
        </aside>

        <section className="chat-panel">
          <div className="chat-topbar">
            <div className="chat-ai-profile">
              <div className="chat-ai-avatar">
                <Bot size={21} />
              </div>

              <div>
                <strong>
                  Navigator AI
                </strong>

                <span>
                  {mode === "rag"
                    ? "Grounded document intelligence"
                    : "Controlled action agent"}
                </span>
              </div>
            </div>

            <div className="assistant-live-badge">
              <span />
              Local AI online
            </div>
          </div>

          <div className="chat-messages">
            <AnimatePresence
              initial={false}
            >
              {messages.map(
                (message) => (
                  <motion.div
                    key={message.id}
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    className={
                      message.role ===
                      "user"
                        ? "chat-message user"
                        : "chat-message assistant"
                    }
                  >
                    <div className="message-avatar">
                      {message.role ===
                      "user" ? (
                        <UserRound
                          size={16}
                        />
                      ) : (
                        <Bot size={16} />
                      )}
                    </div>

                    <div className="message-body">
                      <div className="message-meta">
                        <strong>
                          {message.role ===
                          "user"
                            ? "You"
                            : "Navigator AI"}
                        </strong>

                        {message.mode && (
                          <span>
                            {message.mode ===
                            "rag"
                              ? "RAG"
                              : "AGENT"}
                          </span>
                        )}
                      </div>

                      <p>
                        {message.text}
                      </p>

                      {message.sources &&
                        message.sources
                          .length > 0 && (
                          <div className="message-sources">
                            <div className="source-title">
                              <Sparkles
                                size={13}
                              />
                              Grounded sources
                            </div>

                            <div className="source-chip-list">
                              {message.sources.map(
                                (
                                  source,
                                  index
                                ) => (
                                  <span
                                    key={
                                      index
                                    }
                                    className="source-chip"
                                  >
                                    Chunk{" "}
                                    {source.chunkIndex ??
                                      index +
                                        1}

                                    {typeof source.score ===
                                      "number" &&
                                      ` • ${Math.round(
                                        source.score *
                                          100
                                      )}%`}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  </motion.div>
                )
              )}
            </AnimatePresence>

            {pendingAgentAction && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="chat-message assistant"
              >
                <div className="message-avatar">
                  <Bot size={16} />
                </div>

                <div className="message-body agent-confirmation-message">
                  <AgentActionCard
                    title="Confirm workflow action"
                    description={
                      pendingAgentAction.description
                    }
                    loading={loading}
                    onConfirm={
                      confirmAgentAction
                    }
                    onCancel={() => {
                      setPendingAgentAction(null);

                      setMessages(
                        (current) => [
                          ...current,
                          {
                            id: crypto.randomUUID(),
                            role: "assistant",
                            text:
                              "The workflow action was cancelled. No changes were made.",
                            mode: "agent",
                          },
                        ]
                      );
                    }}
                  />
                </div>
              </motion.div>
            )}

            {loading && (
              <motion.div
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                className="chat-message assistant"
              >
                <div className="message-avatar">
                  <Bot size={16} />
                </div>

                <div className="typing-bubble">
                  <span />
                  <span />
                  <span />
                </div>
              </motion.div>
            )}

            <div
              ref={messagesEndRef}
            />
          </div>

          <div className="assistant-suggestions">
            {suggestions.map(
              (suggestion) => (
                <button
                  key={suggestion}
                  onClick={() =>
                    sendMessage(
                      suggestion
                    )
                  }
                  disabled={loading}
                >
                  <Zap size={13} />
                  {suggestion}
                </button>
              )
            )}
          </div>

          <div className="chat-composer">
            <textarea
              value={input}
              onChange={(event) =>
                setInput(
                  event.target.value
                )
              }
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey
                ) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={
                mode === "rag"
                  ? "Ask something about your documents..."
                  : "Ask the agent to manage your workflow..."
              }
              rows={1}
            />

            <button
              className="chat-send-button"
              disabled={
                loading ||
                !input.trim()
              }
              onClick={() =>
                sendMessage()
              }
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </div>

          <p className="chat-disclaimer">
            Navigator AI uses local models.
            Verify important real-world
            decisions independently.
          </p>
        </section>
      </section>
    </main>
  );
}
