import {
  lazy,
  Suspense,
  type ReactNode,
} from "react";

import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import {
  useAuth,
} from "./context/AuthContext";

import AppShell from "./components/layout/AppShell";
import PageLoader from "./components/ui/PageLoader";

const LoginPage =
  lazy(() =>
    import("./pages/LoginPage")
  );

const RegisterPage =
  lazy(() =>
    import("./pages/RegisterPage")
  );

const DashboardPage =
  lazy(() =>
    import("./pages/DashboardPage")
  );

const DocumentsPage =
  lazy(() =>
    import("./pages/DocumentsPage")
  );

const WorkflowsPage =
  lazy(() =>
    import("./pages/WorkflowsPage")
  );

const AssistantPage =
  lazy(() =>
    import("./pages/AssistantPage")
  );

const AdminPage =
  lazy(() =>
    import("./pages/AdminPage")
  );

const AdminLoginPage =
  lazy(() =>
    import("./pages/AdminLoginPage")
  );

const HistoryPage =
  lazy(() =>
    import("./pages/HistoryPage")
  );

const NotFoundPage =
  lazy(() =>
    import("./pages/NotFoundPage")
  );

const ProtectedRoute = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { token } = useAuth();

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
};

const ProtectedShell = ({
  children,
}: {
  children: ReactNode;
}) => {
  return (
    <ProtectedRoute>
      <AppShell>
        {children}
      </AppShell>
    </ProtectedRoute>
  );
};

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/admin/login"
          element={<AdminLoginPage />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedShell>
              <DashboardPage />
            </ProtectedShell>
          }
        />

        <Route
          path="/documents"
          element={
            <ProtectedShell>
              <DocumentsPage />
            </ProtectedShell>
          }
        />

        <Route
          path="/workflows"
          element={
            <ProtectedShell>
              <WorkflowsPage />
            </ProtectedShell>
          }
        />

        <Route
          path="/assistant"
          element={
            <ProtectedShell>
              <AssistantPage />
            </ProtectedShell>
          }
        />

        <Route
          path="/history"
          element={
            <ProtectedShell>
              <HistoryPage />
            </ProtectedShell>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedShell>
              <AdminPage />
            </ProtectedShell>
          }
        />

        <Route
          path="*"
          element={
            <NotFoundPage />
          }
        />
      </Routes>
    </Suspense>
  );
}
