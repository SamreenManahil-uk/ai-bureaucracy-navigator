import {
  useEffect,
  useState,
} from "react";

import {
  Database,
  FileText,
  ShieldCheck,
  Users,
  Workflow,
} from "lucide-react";

import {
  Navigate,
} from "react-router-dom";

import toast from "react-hot-toast";

import {
  useAuth,
} from "../context/AuthContext";

import {
  getAdminStats,
  type AdminStats,
} from "../services/admin";

import {
  Skeleton,
} from "../components/ui/Skeleton";

export default function AdminPage() {
  const { user } = useAuth();

  const [stats, setStats] =
    useState<AdminStats | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    if (user?.role !== "ADMIN") {
      return;
    }

    getAdminStats()
      .then(setStats)
      .catch((error) =>
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to load admin stats"
        )
      )
      .finally(() =>
        setLoading(false)
      );
  }, [user?.role]);

  if (user?.role !== "ADMIN") {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return (
    <main className="admin-page">
      <section className="admin-heading">
        <div>
          <p className="section-kicker">
            PLATFORM CONTROL
          </p>

          <h1>
            Admin command centre
          </h1>

          <p>
            System-level visibility into
            Navigator AI usage and resources.
          </p>
        </div>

        <div className="admin-role-badge">
          <ShieldCheck size={16} />
          ADMIN
        </div>
      </section>

      <section className="admin-stat-grid">
        {loading ? (
          <>
            <Skeleton className="admin-stat-skeleton" />
            <Skeleton className="admin-stat-skeleton" />
            <Skeleton className="admin-stat-skeleton" />
          </>
        ) : (
          <>
            <article className="admin-stat-card">
              <div className="admin-stat-icon">
                <Users size={21} />
              </div>

              <span>
                Registered users
              </span>

              <strong>
                {stats?.users ?? 0}
              </strong>
            </article>

            <article className="admin-stat-card">
              <div className="admin-stat-icon">
                <FileText size={21} />
              </div>

              <span>
                Documents
              </span>

              <strong>
                {stats?.documents ?? 0}
              </strong>
            </article>

            <article className="admin-stat-card">
              <div className="admin-stat-icon">
                <Workflow size={21} />
              </div>

              <span>
                Workflows
              </span>

              <strong>
                {stats?.workflows ?? 0}
              </strong>
            </article>
          </>
        )}
      </section>

      <section className="admin-system-grid">
        <article className="admin-system-card">
          <Database size={23} />

          <div>
            <p className="section-kicker">
              DATABASE
            </p>

            <h3>
              MongoDB
            </h3>

            <span>
              Application data,
              document metadata and
              workflows.
            </span>
          </div>

          <div className="system-online">
            Online
          </div>
        </article>

        <article className="admin-system-card">
          <ShieldCheck size={23} />

          <div>
            <p className="section-kicker">
              ACCESS CONTROL
            </p>

            <h3>
              JWT + RBAC
            </h3>

            <span>
              Protected user ownership
              and admin authorization.
            </span>
          </div>

          <div className="system-online">
            Active
          </div>
        </article>
      </section>
    </main>
  );
}
