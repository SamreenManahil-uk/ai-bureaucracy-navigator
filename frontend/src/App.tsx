import { useEffect, useMemo, useState } from "react";
import { getDocuments, getHealth } from "./services/api";
import type { DocumentItem, HealthResponse } from "./types/api";

type Theme = "light" | "dark" | "aurora";

const themeLabels: Record<Theme, string> = {
  light: "Light",
  dark: "Dark",
  aurora: "Aurora",
};

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("bureaucracy-theme");
    return saved === "dark" || saved === "aurora" ? saved : "light";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("bureaucracy-theme", theme);
  }, [theme]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const healthData = await getHealth();
        setHealth(healthData);
      } catch {
        setError("Unable to connect to backend");
        return;
      }

      try {
        const documentData = await getDocuments();
        setDocuments(documentData);
      } catch (error) {
        if (error instanceof Error && error.message === "AUTH_REQUIRED") {
          setError("Login required to view your documents");
        } else {
          setError("Unable to load documents");
        }
      }
    };

    loadData();
  }, []);

  const uploadedCount = documents.length;

  const processedCount = useMemo(
    () => documents.filter((item) => item.status === "processed").length,
    [documents]
  );

  return (
    <div style={styles.appShell}>
      <aside style={styles.sidebar}>
        <div>
          <div style={styles.brandMark}>BN</div>
          <div style={{ marginTop: 14 }}>
            <strong>Navigator AI</strong>
            <div style={styles.smallMuted}>Action intelligence</div>
          </div>
        </div>

        <nav style={styles.nav}>
          {["Overview", "Documents", "Workflows", "AI Assistant", "History"].map(
            (item, index) => (
              <button
                key={item}
                style={{
                  ...styles.navItem,
                  ...(index === 0 ? styles.navItemActive : {}),
                }}
              >
                <span>{index === 0 ? "◈" : "○"}</span>
                {item}
              </button>
            )
          )}
        </nav>

        <div style={styles.sidebarFooter}>
          <div style={styles.miniCard}>
            <div style={styles.smallMuted}>System</div>
            <strong style={{ color: "var(--success)" }}>
              {health?.status === "ok" ? "● Operational" : "● Checking"}
            </strong>
          </div>
        </div>
      </aside>

      <main style={styles.main}>
        <header style={styles.topbar}>
          <div>
            <div style={styles.eyebrow}>AI WORKSPACE</div>
            <h1 style={styles.pageTitle}>Bureaucracy Navigator</h1>
          </div>

          <div style={styles.topActions}>
            <div style={styles.themeSwitcher}>
              {(Object.keys(themeLabels) as Theme[]).map((item) => (
                <button
                  key={item}
                  onClick={() => setTheme(item)}
                  style={{
                    ...styles.themeButton,
                    ...(theme === item ? styles.themeButtonActive : {}),
                  }}
                >
                  {themeLabels[item]}
                </button>
              ))}
            </div>

            <button style={styles.primaryButton}>+ Start Workflow</button>
          </div>
        </header>

        <section style={styles.hero}>
          <div style={styles.heroGlowOne} />
          <div style={styles.heroGlowTwo} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={styles.heroBadge}>MERN • GraphQL • RAG • Agents</div>

            <h2 style={styles.heroTitle}>
              Turn complex documents into
              <br />
              clear, actionable workflows.
            </h2>

            <p style={styles.heroText}>
              Upload process-heavy documents, retrieve grounded evidence,
              generate structured actions, and manage every step from one
              intelligent workspace.
            </p>

            <div style={styles.heroActions}>
              <button style={styles.primaryButton}>Upload Document</button>
              <button style={styles.secondaryButton}>Explore Workflows</button>
            </div>
          </div>
        </section>

        {error && <div style={styles.errorBox}>{error}</div>}

        <section style={styles.statGrid}>
          <StatCard
            label="Uploaded Documents"
            value={String(uploadedCount)}
            detail="Available in MongoDB"
          />
          <StatCard
            label="Processed"
            value={String(processedCount)}
            detail="Ready for retrieval"
          />
          <StatCard
            label="Active Workflows"
            value="0"
            detail="Workflow engine coming next"
          />
          <StatCard
            label="AI Service"
            value={health?.status === "ok" ? "Online" : "Checking"}
            detail={health?.service ?? "Connecting to backend"}
          />
        </section>

        <section style={styles.contentGrid}>
          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <div>
                <div style={styles.eyebrow}>DOCUMENT LIBRARY</div>
                <h3 style={styles.panelTitle}>Recent documents</h3>
              </div>

              <button style={styles.ghostButton}>View all</button>
            </div>

            <div style={styles.documentList}>
              {documents.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>↥</div>
                  <strong>No documents yet</strong>
                  <div style={styles.smallMuted}>
                    Upload your first document to begin.
                  </div>
                </div>
              ) : (
                documents.map((document) => (
                  <article key={document._id} style={styles.documentCard}>
                    <div style={styles.documentIcon}>PDF</div>

                    <div style={{ flex: 1 }}>
                      <strong>{document.filename}</strong>
                      <div style={styles.smallMuted}>
                        Stored securely in the document workspace
                      </div>
                    </div>

                    <span style={styles.statusBadge}>{document.status}</span>
                  </article>
                ))
              )}
            </div>
          </div>

          <div style={styles.panel}>
            <div style={styles.eyebrow}>INTELLIGENCE PIPELINE</div>
            <h3 style={styles.panelTitle}>How your document becomes action</h3>

            <div style={styles.timeline}>
              {[
                ["01", "Document intake", "Validate and extract source text"],
                ["02", "Semantic indexing", "Chunk and create embeddings"],
                ["03", "Grounded retrieval", "Find the most relevant context"],
                ["04", "Action generation", "Create structured workflow steps"],
              ].map(([number, title, description]) => (
                <div key={number} style={styles.timelineItem}>
                  <div style={styles.timelineNumber}>{number}</div>
                  <div>
                    <strong>{title}</strong>
                    <div style={styles.smallMuted}>{description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article style={styles.statCard}>
      <div style={styles.smallMuted}>{label}</div>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statDetail}>{detail}</div>
    </article>
  );
}

const styles: Record<string, React.CSSProperties> = {
  appShell: {
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "240px minmax(0, 1fr)",
  },
  sidebar: {
    position: "sticky",
    top: 0,
    height: "100vh",
    padding: "28px 20px",
    borderRight: "1px solid var(--border)",
    background: "var(--surface)",
    backdropFilter: "blur(24px)",
    display: "flex",
    flexDirection: "column",
  },
  brandMark: {
    width: 44,
    height: 44,
    borderRadius: 14,
    background:
      "linear-gradient(135deg, var(--primary), var(--primary-2), var(--accent))",
    display: "grid",
    placeItems: "center",
    color: "white",
    fontWeight: 800,
    boxShadow: "var(--shadow)",
  },
  nav: {
    display: "grid",
    gap: 7,
    marginTop: 38,
  },
  navItem: {
    border: "none",
    background: "transparent",
    color: "var(--muted)",
    padding: "12px 14px",
    borderRadius: 12,
    display: "flex",
    gap: 10,
    alignItems: "center",
    textAlign: "left",
  },
  navItemActive: {
    background: "var(--surface-soft)",
    color: "var(--text)",
    fontWeight: 700,
  },
  sidebarFooter: {
    marginTop: "auto",
  },
  miniCard: {
    border: "1px solid var(--border)",
    borderRadius: 14,
    padding: 14,
    background: "var(--surface-soft)",
  },
  main: {
    minWidth: 0,
    padding: "28px 34px 50px",
  },
  topbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
    marginBottom: 24,
  },
  topActions: {
    display: "flex",
    gap: 12,
    alignItems: "center",
  },
  themeSwitcher: {
    display: "flex",
    gap: 4,
    padding: 4,
    border: "1px solid var(--border)",
    borderRadius: 14,
    background: "var(--surface)",
  },
  themeButton: {
    border: "none",
    padding: "8px 11px",
    borderRadius: 10,
    background: "transparent",
    color: "var(--muted)",
  },
  themeButtonActive: {
    background: "var(--surface-soft)",
    color: "var(--text)",
    fontWeight: 700,
  },
  eyebrow: {
    fontSize: 11,
    letterSpacing: "0.14em",
    fontWeight: 800,
    color: "var(--primary)",
  },
  pageTitle: {
    margin: "5px 0 0",
    fontSize: 28,
    letterSpacing: "-0.03em",
  },
  hero: {
    position: "relative",
    overflow: "hidden",
    border: "1px solid var(--border)",
    borderRadius: 28,
    padding: "54px",
    background:
      "linear-gradient(135deg, color-mix(in srgb, var(--surface-solid) 94%, var(--primary) 6%), var(--surface))",
    boxShadow: "var(--shadow)",
  },
  heroGlowOne: {
    position: "absolute",
    width: 380,
    height: 380,
    borderRadius: "50%",
    right: -100,
    top: -180,
    background: "var(--primary)",
    opacity: 0.1,
    filter: "blur(20px)",
  },
  heroGlowTwo: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: "50%",
    right: 170,
    bottom: -160,
    background: "var(--accent)",
    opacity: 0.1,
    filter: "blur(20px)",
  },
  heroBadge: {
    display: "inline-flex",
    padding: "7px 11px",
    borderRadius: 999,
    background: "var(--surface-soft)",
    color: "var(--primary)",
    fontSize: 12,
    fontWeight: 800,
  },
  heroTitle: {
    fontSize: "clamp(36px, 5vw, 64px)",
    lineHeight: 1.02,
    letterSpacing: "-0.055em",
    margin: "20px 0 18px",
    maxWidth: 900,
  },
  heroText: {
    maxWidth: 680,
    color: "var(--muted)",
    fontSize: 17,
    lineHeight: 1.7,
  },
  heroActions: {
    display: "flex",
    gap: 12,
    marginTop: 28,
    flexWrap: "wrap",
  },
  primaryButton: {
    border: "none",
    color: "white",
    background:
      "linear-gradient(135deg, var(--primary), var(--primary-2))",
    padding: "11px 17px",
    borderRadius: 12,
    fontWeight: 800,
    boxShadow: "0 10px 25px color-mix(in srgb, var(--primary) 28%, transparent)",
  },
  secondaryButton: {
    border: "1px solid var(--border)",
    color: "var(--text)",
    background: "var(--surface)",
    padding: "11px 17px",
    borderRadius: 12,
    fontWeight: 700,
  },
  ghostButton: {
    border: "1px solid var(--border)",
    color: "var(--text)",
    background: "transparent",
    padding: "8px 11px",
    borderRadius: 10,
  },
  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 16,
    marginTop: 18,
  },
  statCard: {
    border: "1px solid var(--border)",
    borderRadius: 18,
    padding: 20,
    background: "var(--surface)",
    boxShadow: "var(--shadow)",
    backdropFilter: "blur(20px)",
  },
  statValue: {
    fontSize: 28,
    fontWeight: 800,
    marginTop: 9,
  },
  statDetail: {
    fontSize: 12,
    color: "var(--muted)",
    marginTop: 6,
  },
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "1.5fr 1fr",
    gap: 18,
    marginTop: 18,
  },
  panel: {
    border: "1px solid var(--border)",
    borderRadius: 22,
    padding: 22,
    background: "var(--surface)",
    boxShadow: "var(--shadow)",
    backdropFilter: "blur(20px)",
  },
  panelHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  panelTitle: {
    margin: "6px 0 18px",
    fontSize: 20,
  },
  documentList: {
    display: "grid",
    gap: 10,
  },
  documentCard: {
    display: "flex",
    alignItems: "center",
    gap: 13,
    padding: 14,
    borderRadius: 14,
    background: "var(--surface-soft)",
    border: "1px solid var(--border)",
  },
  documentIcon: {
    width: 42,
    height: 42,
    display: "grid",
    placeItems: "center",
    borderRadius: 12,
    background:
      "linear-gradient(135deg, var(--primary), var(--primary-2))",
    color: "white",
    fontSize: 11,
    fontWeight: 900,
  },
  statusBadge: {
    padding: "6px 9px",
    borderRadius: 999,
    background: "color-mix(in srgb, var(--success) 13%, transparent)",
    color: "var(--success)",
    fontSize: 11,
    fontWeight: 800,
    textTransform: "capitalize",
  },
  smallMuted: {
    color: "var(--muted)",
    fontSize: 12,
    marginTop: 4,
  },
  timeline: {
    display: "grid",
    gap: 10,
  },
  timelineItem: {
    display: "flex",
    gap: 13,
    alignItems: "flex-start",
    padding: 13,
    borderRadius: 14,
    background: "var(--surface-soft)",
  },
  timelineNumber: {
    width: 34,
    height: 34,
    borderRadius: 11,
    display: "grid",
    placeItems: "center",
    background: "var(--surface-solid)",
    border: "1px solid var(--border)",
    fontWeight: 800,
    color: "var(--primary)",
    fontSize: 11,
  },
  emptyState: {
    minHeight: 180,
    display: "grid",
    placeItems: "center",
    alignContent: "center",
    gap: 8,
    textAlign: "center",
  },
  emptyIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    display: "grid",
    placeItems: "center",
    background: "var(--surface-soft)",
    color: "var(--primary)",
    fontSize: 22,
  },
  errorBox: {
    marginTop: 18,
    padding: 14,
    borderRadius: 14,
    border: "1px solid #ef4444",
    background: "rgba(239, 68, 68, 0.08)",
  },
};

export default App;
